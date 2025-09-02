package ru.kata.spring.boot_security.demo.service;

import ru.kata.spring.boot_security.demo.model.Role;
import java.util.List;
import java.util.Set;

public interface RoleService {
    List<Role> getAllRoles();
    Role getRoleById(Long id);
    Role getRoleByName(String name);
    void saveRole(Role role);
    Set<Role> getRolesByIds(List<Long> roleIds);
    Set<Role> getDefaultRoles();
}