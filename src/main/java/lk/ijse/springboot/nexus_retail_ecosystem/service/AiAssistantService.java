package lk.ijse.springboot.nexus_retail_ecosystem.service;

public interface AiAssistantService {

    // We keep the record here so both the Impl and Controller can easily see it
    record SearchRequest(String category, Double maxPrice) {}

    String searchInventory(SearchRequest request);
}