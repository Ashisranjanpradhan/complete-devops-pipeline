package com.opsmind.auth;

import com.opsmind.common.BadRequestException;
import com.opsmind.common.ResourceNotFoundException;
import com.opsmind.user.Role;
import com.opsmind.user.RoleName;
import com.opsmind.user.RoleRepository;
import com.opsmind.user.User;
import com.opsmind.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        UserSummary summary = UserSummary.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roles)
                .build();

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .user(summary)
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address already in use");
        }

        Set<Role> roles = new HashSet<>();
        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            Role defaultRole = roleRepository.findByName(RoleName.ROLE_DEVELOPER)
                    .orElseGet(() -> roleRepository.save(Role.builder()
                            .name(RoleName.ROLE_DEVELOPER)
                            .description("Developer role")
                            .build()));
            roles.add(defaultRole);
        } else {
            for (String roleNameStr : request.getRoles()) {
                try {
                    String formatted = roleNameStr.startsWith("ROLE_") ? roleNameStr : "ROLE_" + roleNameStr.toUpperCase();
                    RoleName roleName = RoleName.valueOf(formatted);
                    Role role = roleRepository.findByName(roleName)
                            .orElseGet(() -> roleRepository.save(Role.builder()
                                    .name(roleName)
                                    .description(roleName.name() + " role")
                                    .build()));
                    roles.add(role);
                } catch (IllegalArgumentException ex) {
                    // Fallback to developer
                    Role defaultRole = roleRepository.findByName(RoleName.ROLE_DEVELOPER)
                            .orElseGet(() -> roleRepository.save(Role.builder()
                                    .name(RoleName.ROLE_DEVELOPER)
                                    .description("Developer role")
                                    .build()));
                    roles.add(defaultRole);
                }
            }
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName() != null ? request.getFullName() : request.getUsername())
                .enabled(true)
                .roles(roles)
                .build();

        userRepository.save(user);

        List<String> roleStrings = roles.stream().map(r -> r.getName().name()).collect(Collectors.toList());
        String jwt = tokenProvider.generateTokenFromUsername(user.getUsername(), roleStrings);

        UserSummary summary = UserSummary.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roleStrings)
                .build();

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .user(summary)
                .build();
    }

    @Transactional(readOnly = true)
    public UserSummary getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return UserSummary.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roles)
                .build();
    }
}
