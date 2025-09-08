package com.example.aos_backend.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;

import com.example.aos_backend.Repository.ServiceRepository;
import com.example.aos_backend.dto.ServiceDTO;
import com.example.aos_backend.user.ServiceEntity;

@SpringBootTest
public class ServiceServiceTest {

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private ServiceService serviceService;

    private ServiceEntity serviceEntity;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        serviceEntity = new ServiceEntity() {
            @Override
            public String getType() {
                return "TransportService";
            }
        };
        serviceEntity.setId(1L);
        serviceEntity.setNom("Test Service");
        serviceEntity.setIsActive(true);
    }

    @Test
    public void testGetAllServices() {
        when(serviceRepository.findAll()).thenReturn(Arrays.asList(serviceEntity));

        List<ServiceDTO> services = serviceService.getAllServices();

        assertNotNull(services);
        assertEquals(1, services.size());
        assertEquals("Test Service", services.get(0).getNom());
    }

    @Test
    public void testGetServiceById() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(serviceEntity));

        ServiceDTO service = serviceService.getServiceById(1L);

        assertNotNull(service);
        assertEquals("Test Service", service.getNom());
    }

    @Test
    public void testGetServiceByIdNotFound() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.empty());

        ServiceDTO service = serviceService.getServiceById(1L);

        assertNull(service);
    }
}
