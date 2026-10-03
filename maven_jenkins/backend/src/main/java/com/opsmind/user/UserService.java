package com.opsmind.user;

import com.opsmind.common.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateUserRoles(Long id, UserRoleUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        Set<Role> roles = new HashSet<>();
        for (String roleNameStr : request.getRoles()) {
            String formatted = roleNameStr.startsWith("ROLE_") ? roleNameStr : "ROLE_" + roleNameStr.toUpperCase();
            Role role = roleRepository.findByName(RoleName.valueOf(formatted))
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleNameStr));
            roles.add(role);
        }

        user.setRoles(roles);
        return UserResponse.fromEntity(userRepository.save(user));
    }

    @Transactional
    public void toggleUserStatus(Long id, boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setEnabled(enabled);
        userRepository.save(user);
    }
}
