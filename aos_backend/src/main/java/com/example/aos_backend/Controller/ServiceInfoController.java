package com.example.aos_backend.Controller;

import com.example.aos_backend.Service.ServiceInfoService;
import com.example.aos_backend.dto.ServiceDTO;
import com.example.aos_backend.user.ServiceInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = {"http://localhost:4201", "*"})
@Transactional
public class ServiceInfoController {
    
    @Autowired
    private ServiceInfoService serviceInfoService;
    
    @GetMapping
    public ResponseEntity<List<ServiceDTO>> getAllServices() {
        List<ServiceDTO> services = serviceInfoService.getAllServices();
        return ResponseEntity.ok(services);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ServiceDTO> getServiceById(@PathVariable Long id) {
        ServiceDTO service = serviceInfoService.getServiceById(id);
        if (service != null) {
            return ResponseEntity.ok(service);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<ServiceInfo> createService(@RequestBody ServiceInfo serviceInfo) {
        ServiceInfo savedService = serviceInfoService.saveService(serviceInfo);
        return ResponseEntity.ok(savedService);
    }
}
