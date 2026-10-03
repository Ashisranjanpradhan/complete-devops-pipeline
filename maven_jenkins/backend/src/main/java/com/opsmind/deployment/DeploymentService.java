package com.opsmind.deployment;

import com.opsmind.audit.AuditAction;
import com.opsmind.audit.AuditService;
import com.opsmind.common.BadRequestException;
import com.opsmind.common.ResourceNotFoundException;
import com.opsmind.service.HealthStatus;
import com.opsmind.service.ServiceEntity;
import com.opsmind.service.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeploymentService {

    private final DeploymentRepository deploymentRepository;
    private final ServiceRepository serviceRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<DeploymentResponse> getAllDeployments() {
        return deploymentRepository.findByOrderByStartedAtDesc().stream()
                .map(DeploymentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeploymentResponse getDeploymentById(Long id) {
        Deployment deployment = deploymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deployment not found with id: " + id));
        return DeploymentResponse.fromEntity(deployment);
    }

    @Transactional(readOnly = true)
    public List<DeploymentResponse> getDeploymentsByService(Long serviceId) {
        return deploymentRepository.findByServiceIdOrderByStartedAtDesc(serviceId).stream()
                .map(DeploymentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeploymentResponse recordDeployment(DeploymentRequest request) {
        ServiceEntity service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + request.getServiceId()));

        Deployment deployment = Deployment.builder()
                .service(service)
                .version(request.getVersion())
                .commitHash(request.getCommitHash() != null ? request.getCommitHash() : "manual-" + System.currentTimeMillis() % 100000)
                .environment(request.getEnvironment() != null ? request.getEnvironment() : service.getEnvironment())
                .status(request.getStatus() != null ? request.getStatus() : DeploymentStatus.SUCCESS)
                .triggeredBy(request.getTriggeredBy() != null ? request.getTriggeredBy() : "Operator")
                .startedAt(Instant.now())
                .completedAt(request.getStatus() == DeploymentStatus.SUCCESS ? Instant.now() : null)
                .build();

        Deployment saved = deploymentRepository.save(deployment);

        if (saved.getStatus() == DeploymentStatus.SUCCESS) {
            service.setCurrentVersion(saved.getVersion());
            serviceRepository.save(service);
        }

        auditService.log(
                saved.getTriggeredBy(),
                AuditAction.DEPLOYMENT_STARTED,
                "deployment:" + service.getName() + ":" + saved.getVersion(),
                "Started deployment version " + saved.getVersion() + " to " + saved.getEnvironment()
        );

        return DeploymentResponse.fromEntity(saved);
    }

    @Transactional
    public DeploymentResponse updateDeploymentStatus(Long id, DeploymentStatus status) {
        Deployment deployment = deploymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deployment not found with id: " + id));

        deployment.setStatus(status);
        if (status == DeploymentStatus.SUCCESS || status == DeploymentStatus.FAILED || status == DeploymentStatus.ROLLED_BACK) {
            deployment.setCompletedAt(Instant.now());
        }

        if (status == DeploymentStatus.SUCCESS) {
            ServiceEntity service = deployment.getService();
            service.setCurrentVersion(deployment.getVersion());
            service.setHealthStatus(HealthStatus.HEALTHY);
            serviceRepository.save(service);
        }

        Deployment updated = deploymentRepository.save(deployment);

        auditService.log(
                deployment.getTriggeredBy() != null ? deployment.getTriggeredBy() : "System",
                status == DeploymentStatus.SUCCESS ? AuditAction.DEPLOYMENT_COMPLETED : AuditAction.DEPLOYMENT_FAILED,
                "deployment:" + deployment.getService().getName() + ":" + deployment.getVersion(),
                "Deployment status updated to " + status
        );

        return DeploymentResponse.fromEntity(updated);
    }

    @Transactional
    public DeploymentResponse rollbackDeployment(Long deploymentId, RollbackRequest request) {
        Deployment currentDeployment = deploymentRepository.findById(deploymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Deployment not found with id: " + deploymentId));

        ServiceEntity service = currentDeployment.getService();

        // Determine target version to rollback to
        String targetVersion = request.getTargetVersion();
        if (targetVersion == null || targetVersion.isBlank()) {
            List<Deployment> history = deploymentRepository.findByServiceIdOrderByStartedAtDesc(service.getId());
            targetVersion = history.stream()
                    .filter(d -> !d.getId().equals(deploymentId) && d.getStatus() == DeploymentStatus.SUCCESS)
                    .map(Deployment::getVersion)
                    .findFirst()
                    .orElse("v1.0.0");
        }

        // Mark current as rolled back
        currentDeployment.setStatus(DeploymentStatus.ROLLED_BACK);
        deploymentRepository.save(currentDeployment);

        // Create new rollback deployment
        Deployment rollbackDeployment = Deployment.builder()
                .service(service)
                .version(targetVersion)
                .commitHash("rollback-to-" + targetVersion)
                .environment(currentDeployment.getEnvironment())
                .status(DeploymentStatus.SUCCESS)
                .triggeredBy(request.getOperator() != null ? request.getOperator() : "Operator")
                .startedAt(Instant.now())
                .completedAt(Instant.now())
                .rollbackOfId(currentDeployment.getId())
                .build();

        Deployment savedRollback = deploymentRepository.save(rollbackDeployment);

        // Update service version and health status
        service.setCurrentVersion(targetVersion);
        service.setHealthStatus(HealthStatus.HEALTHY);
        serviceRepository.save(service);

        auditService.log(
                rollbackDeployment.getTriggeredBy(),
                AuditAction.ROLLBACK_COMPLETED,
                "rollback:" + service.getName() + ":" + targetVersion,
                "Rolled back " + service.getName() + " from " + currentDeployment.getVersion() + " to " + targetVersion + ". Reason: " + request.getReason()
        );

        return DeploymentResponse.fromEntity(savedRollback);
    }
}
