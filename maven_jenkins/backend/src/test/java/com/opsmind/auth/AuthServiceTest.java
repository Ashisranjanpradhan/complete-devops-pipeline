package com.opsmind.auth;

import com.opsmind.common.BadRequestException;
import com.opsmind.user.Role;
import com.opsmind.user.RoleName;
import com.opsmind.user.RoleRepository;
import com.opsmind.user.User;
import com.opsmind.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private Role developerRole;

    @BeforeEach
    void setUp() {
        developerRole = Role.builder()
                .id(1L)
                .name(RoleName.ROLE_DEVELOPER)
                .description("Developer")
                .build();
    }

    @Test
    void register_WhenValidRequest_ShouldCreateUser() {
        RegisterRequest request = RegisterRequest.builder()
                .username("newuser")
                .email("newuser@example.com")
                .password("secret123")
                .fullName("New User")
                .build();

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_DEVELOPER)).thenReturn(Optional.of(developerRole));
        when(passwordEncoder.encode("secret123")).thenReturn("hashedPassword");
        when(tokenProvider.generateTokenFromUsername(any(), any())).thenReturn("mockJwtToken");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mockJwtToken", response.getToken());
        assertEquals("newuser", response.getUser().getUsername());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_WhenUsernameTaken_ShouldThrowBadRequest() {
        RegisterRequest request = RegisterRequest.builder()
                .username("existing")
                .email("test@example.com")
                .password("secret123")
                .build();

        when(userRepository.existsByUsername("existing")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }
}
