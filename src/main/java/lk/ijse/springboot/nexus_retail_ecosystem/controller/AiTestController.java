package lk.ijse.springboot.nexus_retail_ecosystem.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AiTestController {
    private final ChatClient chatClient;

    public AiTestController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @GetMapping("/ai/test")
    public String testAi() {
        return chatClient.prompt("Hello! Who are you?").call().content();
    }
}
