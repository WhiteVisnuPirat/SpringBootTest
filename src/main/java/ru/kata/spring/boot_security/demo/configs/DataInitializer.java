package ru.kata.spring.boot_security.demo.configs;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import javax.annotation.PostConstruct;
import java.util.Set;

@Component
public class DataInitializer {

    private final RoleService roleService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleService roleService, UserService userService, PasswordEncoder passwordEncoder) {
        this.roleService = roleService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void init() {
        // Проверяем, есть ли уже данные в базе
        if (roleService.getAllRoles().isEmpty()) {

            // Создание ролей
            Role adminRole = new Role("ROLE_ADMIN");
            Role userRole = new Role("ROLE_USER");
            roleService.saveRole(adminRole);
            roleService.saveRole(userRole);

            // ТЕСТ: Проверяем кодирование паролей
            String testPassword = "admin";
            String encodedPassword = passwordEncoder.encode(testPassword);
            System.out.println("=== DEBUG: Raw password: " + testPassword + " ===");
            System.out.println("=== DEBUG: Encoded password: " + encodedPassword + " ===");
            System.out.println("=== DEBUG: Matches: " + passwordEncoder.matches(testPassword, encodedPassword) + " ===");

            // Создание администратора
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin"); // UserService закодирует этот пароль
            admin.setFirstname("Admin");
            admin.setLastname("Adminov");
            admin.setEmail("admin@mail.ru");
            admin.setAge(30);
            admin.setRoles(Set.of(adminRole, userRole));
            userService.saveUser(admin);

            // Создание обычного пользователя
            User user = new User();
            user.setUsername("user");
            user.setPassword("user"); // UserService закодирует этот пароль
            user.setFirstname("User");
            user.setLastname("Userov");
            user.setEmail("user@mail.ru");
            user.setAge(25);
            user.setRoles(Set.of(userRole));
            userService.saveUser(user);
        }
    }
}