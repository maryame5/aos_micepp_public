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

import com.example.aos_backend.Repository.ServiceInfoRepository;
import com.example.aos_backend.dto.ServiceDTO;
import com.example.aos_backend.user.ServiceInfo;

@SpringBootTest
public class ServiceInfoServiceTest {

    @Mock
    private ServiceInfoRepository serviceInfoRepository;

    @InjectMocks
    private ServiceInfoService serviceInfoService;

    private ServiceInfo serviceInfo;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        serviceInfo = new ServiceInfo();
        serviceInfo.setId(1L);
        serviceInfo.setIcon("business");
        serviceInfo.setTitle("Test Service");
        serviceInfo.setDescription("Test Description");
        serviceInfo.setFeatures(Arrays.asList("Feature 1", "Feature 2"));
    }

    @Test
    public void testGetAllServices() {
        when(serviceInfoRepository.findAll()).thenReturn(Arrays.asList(serviceInfo));

        List<ServiceDTO> services = serviceInfoService.getAllServices();

        assertNotNull(services);
        assertEquals(1, services.size());
        assertEquals("Test Service", services.get(0).getTitle());
    }

    @Test
    public void testGetServiceById() {
        when(serviceInfoRepository.findById(1L)).thenReturn(Optional.of(serviceInfo));

        ServiceDTO service = serviceInfoService.getServiceById(1L);

        assertNotNull(service);
        assertEquals("Test Service", service.getTitle());
    }

    @Test
    public void testGetServiceByIdNotFound() {
        when(serviceInfoRepository.findById(1L)).thenReturn(Optional.empty());

        ServiceDTO service = serviceInfoService.getServiceById(1L);

        assertNull(service);
    }

    @Test
    public void testSaveService() {
        when(serviceInfoRepository.save(serviceInfo)).thenReturn(serviceInfo);

        ServiceInfo savedService = serviceInfoService.saveService(serviceInfo);

        assertNotNull(savedService);
        assertEquals("Test Service", savedService.getTitle());
    }
}
