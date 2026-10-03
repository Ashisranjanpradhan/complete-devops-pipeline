package com.opsmind.deployment;

import com.opsmind.audit.AuditService;
import com.opsmind.service.HealthStatus;
import com.opsmind.service.ServiceEntity;
import com.opsmind.service.ServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeploymentServiceTest {

    @Mock
    private DeploymentRepository deploymentRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private DeploymentService deploymentService;

    private ServiceEntity service;

    @BeforeEach
    void setUp() {
        service = ServiceEntity.builder()
                .id(1L)
                .name("order-service")
                .environment("production")
                .currentVersion("v1.0.0")
                .healthStatus(HealthStatus.HEALTHY)
                .build();
    }

    @Test
    void recordDeployment_ShouldCreateDeploymentAndUpdateServiceVersion() {
        DeploymentRequest request = new DeploymentRequest();
        request.setServiceId(1L);
        request.setVersion("v1.1.0");
        request.setCommitHash("abcdef1");
        request.setTriggeredBy("jenkins");
        request.setStatus(DeploymentStatus.SUCCESS);

        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(deploymentRepository.save(any(Deployment.class))).thenAnswer(invocation -> {
            Deployment d = invocation.getArgument(0);
            d.setId(5L);
            return d;
        });

        DeploymentResponse response = deploymentService.recordDeployment(request);

        assertNotNull(response);
        assertEquals("v1.1.0", response.getVersion());
        assertEquals("v1.1.0", service.getCurrentVersion());
        verify(serviceRepository, times(1)).save(service);
        verify(auditService, times(1)).log(any(), any(), any(), any());
    }

    @Test
    void rollbackDeployment_WithExplicitTargetVersion_ShouldRollback() {
        Deployment currentDeployment = Deployment.builder()
                .id(5L)
                .service(service)
                .version("v1.1.0")
                .environment("production")
                .status(DeploymentStatus.SUCCESS)
                .startedAt(Instant.now().minusSeconds(300))
                .build();

        when(deploymentRepository.findById(5L)).thenReturn(Optional.of(currentDeployment));
        when(deploymentRepository.save(any(Deployment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RollbackRequest rollbackRequest = new RollbackRequest();
        rollbackRequest.setTargetVersion("v1.0.0");
        rollbackRequest.setReason("High error rate");
        rollbackRequest.setOperator("devops-admin");

        DeploymentResponse response = deploymentService.rollbackDeployment(5L, rollbackRequest);

        assertNotNull(response);
        assertEquals("v1.0.0", response.getVersion());
        assertEquals(DeploymentStatus.ROLLED_BACK, currentDeployment.getStatus());
        assertEquals("v1.0.0", service.getCurrentVersion());
        verify(auditService, times(1)).log(any(), any(), any(), any());
    }

    @Test
    void rollbackDeployment_WithoutTargetVersion_ShouldAutoFindPreviousSuccessfulDeployment() {
        Deployment currentDeployment = Deployment.builder()
                .id(5L)
                .service(service)
                .version("v1.1.0")
                .environment("production")
                .status(DeploymentStatus.SUCCESS)
                .startedAt(Instant.now().minusSeconds(300))
                .build();

        Deployment previousDeployment = Deployment.builder()
                .id(4L)
                .service(service)
                .version("v1.0.5")
                .environment("production")
                .status(DeploymentStatus.SUCCESS)
                .startedAt(Instant.now().minusSeconds(10000))
                .build();

        when(deploymentRepository.findById(5L)).thenReturn(Optional.of(currentDeployment));
        when(deploymentRepository.findByServiceIdOrderByStartedAtDesc(1L))
                .thenReturn(List.of(currentDeployment, previousDeployment));
        when(deploymentRepository.save(any(Deployment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RollbackRequest rollbackRequest = new RollbackRequest();
        rollbackRequest.setReason("Severe memory leak");
        rollbackRequest.setOperator("oncall");

        DeploymentResponse response = deploymentService.rollbackDeployment(5L, rollbackRequest);

        assertNotNull(response);
        assertEquals("v1.0.5", response.getVersion());
        assertEquals(DeploymentStatus.ROLLED_BACK, currentDeployment.getStatus());
        assertEquals("v1.0.5", service.getCurrentVersion());
        verify(auditService, times(1)).log(any(), any(), any(), any());
    }
}
