package com.opsmind.service;

import com.opsmind.common.BadRequestException;
import com.opsmind.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceManagementService {

    private final ServiceRepository serviceRepository;

    @Transactional(readOnly = true)
    public List<ServiceResponse> getAllServices() {
        return serviceRepository.findAll().stream()
                .map(ServiceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceResponse getServiceById(Long id) {
        ServiceEntity entity = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        return ServiceResponse.fromEntity(entity);
    }

    @Transactional
    public ServiceResponse createService(ServiceRequest request) {
        if (serviceRepository.existsByName(request.getName())) {
            throw new BadRequestException("Service already exists with name: " + request.getName());
        }

        ServiceEntity entity = ServiceEntity.builder()
                .name(request.getName())
                .description(request.getDescription())
                .repositoryUrl(request.getRepositoryUrl())
                .environment(request.getEnvironment() != null ? request.getEnvironment() : "production")
                .owner(request.getOwner())
                .currentVersion(request.getCurrentVersion() != null ? request.getCurrentVersion() : "v1.0.0")
                .healthStatus(request.getHealthStatus() != null ? request.getHealthStatus() : HealthStatus.HEALTHY)
                .build();

        return ServiceResponse.fromEntity(serviceRepository.save(entity));
    }

    @Transactional
    public ServiceResponse updateService(Long id, ServiceRequest request) {
        ServiceEntity entity = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        if (!entity.getName().equals(request.getName()) && serviceRepository.existsByName(request.getName())) {
            throw new BadRequestException("Service name already taken: " + request.getName());
        }

        entity.setName(request.getName());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());
        if (request.getRepositoryUrl() != null) entity.setRepositoryUrl(request.getRepositoryUrl());
        if (request.getEnvironment() != null) entity.setEnvironment(request.getEnvironment());
        if (request.getOwner() != null) entity.setOwner(request.getOwner());
        if (request.getCurrentVersion() != null) entity.setCurrentVersion(request.getCurrentVersion());
        if (request.getHealthStatus() != null) entity.setHealthStatus(request.getHealthStatus());

        return ServiceResponse.fromEntity(serviceRepository.save(entity));
    }

    @Transactional
    public void deleteService(Long id) {
        if (!serviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Service not found with id: " + id);
        }
        serviceRepository.deleteById(id);
    }

    @Transactional
    public ServiceResponse updateHealthStatus(Long id, HealthStatus status) {
        ServiceEntity entity = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        entity.setHealthStatus(status);
        return ServiceResponse.fromEntity(serviceRepository.save(entity));
    }
}
