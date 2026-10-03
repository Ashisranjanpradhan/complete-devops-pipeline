package com.opsmind;

import com.opsmind.deployment.Deployment;
import com.opsmind.deployment.DeploymentRepository;
import com.opsmind.deployment.DeploymentStatus;
import com.opsmind.incident.*;
import com.opsmind.monitoring.MetricsSnapshot;
import com.opsmind.monitoring.MetricsSnapshotRepository;
import com.opsmind.service.HealthStatus;
import com.opsmind.service.ServiceEntity;
import com.opsmind.service.ServiceRepository;
import com.opsmind.user.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final DeploymentRepository deploymentRepository;
    private final IncidentRepository incidentRepository;
    private final IncidentEventRepository incidentEventRepository;
    private final MetricsSnapshotRepository metricsSnapshotRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Checking and initializing OpsMind default seed data...");

        // 1. Roles
        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleName.ROLE_ADMIN)
                        .description("Platform Administrator")
                        .build()));

        Role devopsRole = roleRepository.findByName(RoleName.ROLE_DEVOPS_ENGINEER)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleName.ROLE_DEVOPS_ENGINEER)
                        .description("DevOps Specialist")
                        .build()));

        Role devRole = roleRepository.findByName(RoleName.ROLE_DEVELOPER)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleName.ROLE_DEVELOPER)
                        .description("Software Developer")
                        .build()));

        Role viewerRole = roleRepository.findByName(RoleName.ROLE_VIEWER)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(RoleName.ROLE_VIEWER)
                        .description("Operations Viewer")
                        .build()));

        // 2. Users
        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(User.builder()
                    .username("admin")
                    .email("admin@opsmind.io")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .fullName("OpsMind Administrator")
                    .enabled(true)
                    .roles(Set.of(adminRole, devopsRole))
                    .build());
        }

        if (!userRepository.existsByUsername("devops")) {
            userRepository.save(User.builder()
                    .username("devops")
                    .email("devops@opsmind.io")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .fullName("DevOps Lead")
                    .enabled(true)
                    .roles(Set.of(devopsRole))
                    .build());
        }

        if (!userRepository.existsByUsername("developer")) {
            userRepository.save(User.builder()
                    .username("developer")
                    .email("dev@opsmind.io")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .fullName("FullStack Engineer")
                    .enabled(true)
                    .roles(Set.of(devRole))
                    .build());
        }

        if (!userRepository.existsByUsername("viewer")) {
            userRepository.save(User.builder()
                    .username("viewer")
                    .email("viewer@opsmind.io")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .fullName("Operations Observer")
                    .enabled(true)
                    .roles(Set.of(viewerRole))
                    .build());
        }

        // 3. Services
        if (serviceRepository.count() == 0) {
            ServiceEntity paymentService = serviceRepository.save(ServiceEntity.builder()
                    .name("payment-service")
                    .description("Core payment gateway, transactions and recurring billing")
                    .repositoryUrl("https://github.com/company/payment-service")
                    .environment("production")
                    .owner("payments-team")
                    .currentVersion("v2.8.1")
                    .healthStatus(HealthStatus.DEGRADED)
                    .build());

            ServiceEntity authService = serviceRepository.save(ServiceEntity.builder()
                    .name("auth-service")
                    .description("OAuth2 and identity provider service")
                    .repositoryUrl("https://github.com/company/auth-service")
                    .environment("production")
                    .owner("security-team")
                    .currentVersion("v1.4.2")
                    .healthStatus(HealthStatus.HEALTHY)
                    .build());

            serviceRepository.save(ServiceEntity.builder()
                    .name("order-service")
                    .description("Order fulfillment and checkout management")
                    .repositoryUrl("https://github.com/company/order-service")
                    .environment("staging")
                    .owner("orders-team")
                    .currentVersion("v3.1.0")
                    .healthStatus(HealthStatus.HEALTHY)
                    .build());

            serviceRepository.save(ServiceEntity.builder()
                    .name("notification-service")
                    .description("Email, SMS, Slack and webhook dispatcher")
                    .repositoryUrl("https://github.com/company/notification-service")
                    .environment("production")
                    .owner("core-team")
                    .currentVersion("v1.0.5")
                    .healthStatus(HealthStatus.HEALTHY)
                    .build());

            // 4. Deployments
            deploymentRepository.save(Deployment.builder()
                    .service(paymentService)
                    .version("v2.8.0")
                    .commitHash("e5c9b12")
                    .environment("production")
                    .status(DeploymentStatus.SUCCESS)
                    .triggeredBy("Jenkins")
                    .startedAt(Instant.now().minus(2, ChronoUnit.DAYS))
                    .completedAt(Instant.now().minus(2, ChronoUnit.DAYS).plus(4, ChronoUnit.MINUTES))
                    .build());

            deploymentRepository.save(Deployment.builder()
                    .service(paymentService)
                    .version("v2.8.1")
                    .commitHash("a72f93c")
                    .environment("production")
                    .status(DeploymentStatus.SUCCESS)
                    .triggeredBy("Jenkins")
                    .startedAt(Instant.now().minus(25, ChronoUnit.MINUTES))
                    .completedAt(Instant.now().minus(21, ChronoUnit.MINUTES))
                    .build());

            deploymentRepository.save(Deployment.builder()
                    .service(authService)
                    .version("v1.4.2")
                    .commitHash("c398a10")
                    .environment("production")
                    .status(DeploymentStatus.SUCCESS)
                    .triggeredBy("Jenkins")
                    .startedAt(Instant.now().minus(1, ChronoUnit.DAYS))
                    .completedAt(Instant.now().minus(1, ChronoUnit.DAYS).plus(3, ChronoUnit.MINUTES))
                    .build());

            // 5. Active Incident for payment-service
            Incident incident = incidentRepository.save(Incident.builder()
                    .service(paymentService)
                    .title("Payment API 5xx errors spiked to 14% with high DB connection utilization")
                    .description("Payment API p99 latency surged from 180ms to 2.1s. 5xx errors increased from 0.4% to 14%. HikariCP connection pool saturated at 94% following deployment v2.8.1.")
                    .severity(IncidentSeverity.HIGH)
                    .status(IncidentStatus.INVESTIGATING)
                    .createdBy("Alertmanager")
                    .assignedTo("devops")
                    .createdAt(Instant.now().minus(18, ChronoUnit.MINUTES))
                    .build());

            incidentEventRepository.save(IncidentEvent.builder()
                    .incident(incident)
                    .eventType("DEPLOYMENT")
                    .description("payment-service v2.8.1 deployed to production by Jenkins pipeline #142")
                    .createdBy("Jenkins")
                    .timestamp(Instant.now().minus(21, ChronoUnit.MINUTES))
                    .build());

            incidentEventRepository.save(IncidentEvent.builder()
                    .incident(incident)
                    .eventType("ALERT_TRIGGERED")
                    .description("HighLatencyAlert: p99 latency exceeded 2000ms threshold (measured 2100ms)")
                    .createdBy("Alertmanager")
                    .timestamp(Instant.now().minus(19, ChronoUnit.MINUTES))
                    .build());

            incidentEventRepository.save(IncidentEvent.builder()
                    .incident(incident)
                    .eventType("STATUS_CHANGE")
                    .description("Incident status moved to INVESTIGATING by on-call engineer")
                    .createdBy("devops")
                    .timestamp(Instant.now().minus(12, ChronoUnit.MINUTES))
                    .build());

            // 6. Metrics Snapshots
            metricsSnapshotRepository.save(MetricsSnapshot.builder()
                    .service(paymentService)
                    .latencyMs(180.0)
                    .errorRatePercent(0.4)
                    .cpuUsagePercent(32.5)
                    .memoryUsagePercent(48.0)
                    .dbConnectionsUtilizationPercent(55.0)
                    .capturedAt(Instant.now().minus(30, ChronoUnit.MINUTES))
                    .build());

            metricsSnapshotRepository.save(MetricsSnapshot.builder()
                    .service(paymentService)
                    .latencyMs(185.0)
                    .errorRatePercent(0.4)
                    .cpuUsagePercent(34.0)
                    .memoryUsagePercent(49.5)
                    .dbConnectionsUtilizationPercent(56.0)
                    .capturedAt(Instant.now().minus(25, ChronoUnit.MINUTES))
                    .build());

            metricsSnapshotRepository.save(MetricsSnapshot.builder()
                    .service(paymentService)
                    .latencyMs(850.0)
                    .errorRatePercent(4.2)
                    .cpuUsagePercent(58.0)
                    .memoryUsagePercent(65.0)
                    .dbConnectionsUtilizationPercent(78.0)
                    .capturedAt(Instant.now().minus(20, ChronoUnit.MINUTES))
                    .build());

            metricsSnapshotRepository.save(MetricsSnapshot.builder()
                    .service(paymentService)
                    .latencyMs(2100.0)
                    .errorRatePercent(14.1)
                    .cpuUsagePercent(74.0)
                    .memoryUsagePercent(78.5)
                    .dbConnectionsUtilizationPercent(94.0)
                    .capturedAt(Instant.now().minus(15, ChronoUnit.MINUTES))
                    .build());
        }

        log.info("OpsMind data initialization completed successfully.");
    }
}
