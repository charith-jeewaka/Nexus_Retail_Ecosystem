package lk.ijse.springboot.nexus_retail_ecosystem.controller;

import lk.ijse.springboot.nexus_retail_ecosystem.service.AiAssistantService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai/assistant")
@CrossOrigin
public class AiAssistantController {

    private final ChatClient chatClient;
    private final AiAssistantService aiAssistantService;

    public AiAssistantController(ChatClient.Builder builder, AiAssistantService aiAssistantService) {
        this.aiAssistantService = aiAssistantService;
        this.chatClient = builder
                .defaultSystem("You are a helpful, friendly store assistant for 'Nexus Retail'. " +
                        "Always use your tools to check the store database before recommending any products. " +
                        "If the tool returns no products, politely inform the customer. " +
                        "Keep your answers concise, formatted nicely, and mention prices in Rs.")
                .build();
    }

    @GetMapping("/chat")
    public String chatWithAssistant(@RequestParam String message) {
        return chatClient.prompt(message)
                .tools(aiAssistantService) // Passes the injected interface
                .call()
                .content();
    }
}