package ru.kata.spring.boot_security.demo.configs;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import javax.annotation.PostConstruct;
import java.util.List;
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
        // Сначала создаем роли, если их нет
        createRolesIfNotExist();

        // Затем создаем пользователей, если их нет
        createUsersIfNotExist();
    }

    private void createRolesIfNotExist() {
        if (roleService.getAllRoles().isEmpty()) {
            Role adminRole = new Role("ROLE_ADMIN");
            Role userRole = new Role("ROLE_USER");
            roleService.saveRole(adminRole);
            roleService.saveRole(userRole);
        }
    }

    private void createUsersIfNotExist() {
        if (userService.getAllUsers().isEmpty()) {
            // Получаем роли напрямую из базы
            List<Role> allRoles = roleService.getAllRoles();
            Role adminRole = allRoles.stream()
                    .filter(role -> "ROLE_ADMIN".equals(role.getName()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));

            Role userRole = allRoles.stream()
                    .filter(role -> "ROLE_USER".equals(role.getName()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("ROLE_USER not found"));

            // Создание администратора
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin");
            admin.setFirstname("Admin");
            admin.setLastname("Adminov");
            admin.setEmail("admin@mail.ru");
            admin.setAge(30);
            admin.setRoles(Set.of(adminRole, userRole));
            userService.saveUser(admin);

            // Создание обычного пользователя
            User user = new User();
            user.setUsername("user");
            user.setPassword("user");
            user.setFirstname("User");
            user.setLastname("Userov");
            user.setEmail("user@mail.ru");
            user.setAge(25);
            user.setRoles(Set.of(userRole));
            userService.saveUser(user);
        }
    }
}
