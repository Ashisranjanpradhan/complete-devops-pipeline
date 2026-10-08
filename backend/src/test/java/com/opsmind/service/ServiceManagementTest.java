package com.opsmind.service;

import com.opsmind.common.BadRequestException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceManagementTest {

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private ServiceManagementService serviceManagementService;

    @Test
    void createService_Success() {
        ServiceRequest request = ServiceRequest.builder()
                .name("order-service")
                .description("Handles orders")
                .environment("production")
                .build();

        ServiceEntity savedEntity = ServiceEntity.builder()
                .id(1L)
                .name("order-service")
                .description("Handles orders")
                .environment("production")
                .healthStatus(HealthStatus.HEALTHY)
                .build();

        when(serviceRepository.existsByName("order-service")).thenReturn(false);
        when(serviceRepository.save(any(ServiceEntity.class))).thenReturn(savedEntity);

        ServiceResponse response = serviceManagementService.createService(request);

        assertNotNull(response);
        assertEquals("order-service", response.getName());
        assertEquals(HealthStatus.HEALTHY, response.getHealthStatus());
    }

    @Test
    void createService_DuplicateName_ThrowsException() {
        ServiceRequest request = ServiceRequest.builder()
                .name("order-service")
                .build();

        when(serviceRepository.existsByName("order-service")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> serviceManagementService.createService(request));
    }
}
