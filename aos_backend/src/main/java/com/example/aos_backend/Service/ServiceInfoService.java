package com.example.aos_backend.Service;

import com.example.aos_backend.Repository.ServiceInfoRepository;
import com.example.aos_backend.dto.ServiceDTO;
import com.example.aos_backend.user.ServiceInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ServiceInfoService {
    
    @Autowired
    private ServiceInfoRepository serviceInfoRepository;
    
    public List<ServiceDTO> getAllServices() {
        List<ServiceInfo> services = serviceInfoRepository.findAll();
        return services.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public ServiceDTO getServiceById(Long id) {
        ServiceInfo service = serviceInfoRepository.findById(id).orElse(null);
        return service != null ? convertToDTO(service) : null;
    }
    
    public ServiceInfo saveService(ServiceInfo serviceInfo) {
        return serviceInfoRepository.save(serviceInfo);
    }
    
    private ServiceDTO convertToDTO(ServiceInfo serviceInfo) {
        return ServiceDTO.builder()
                .id(serviceInfo.getId())
                .icon(serviceInfo.getIcon())
                .title(serviceInfo.getTitle())
                .description(serviceInfo.getDescription())
                .features(serviceInfo.getFeatures())
                .build();
    }
}
