package ru.kata.spring.boot_security.demo.dao;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.model.Role;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import java.util.List;

@Repository
public class RoleDaoImpl implements RoleDao {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public List<Role> findAll() {
        TypedQuery<Role> query = entityManager.createQuery("FROM Role", Role.class);
        return query.getResultList();
    }

    @Override
    @Transactional(readOnly = true)
    public Role findById(Long id) {
        return entityManager.find(Role.class, id);
    }

    @Override
    @Transactional(readOnly = true)
    public Role findByName(String name) {
        TypedQuery<Role> query = entityManager.createQuery(
                "FROM Role WHERE name = :name", Role.class);
        query.setParameter("name", name);
        return query.getResultList().stream().findFirst().orElse(null);
    }

    @Override
    @Transactional
    public void save(Role role) {
        entityManager.persist(role);
    }
}