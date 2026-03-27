package lk.ijse.springboot.nexus_retail_ecosystem.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig  implements WebSocketMessageBrokerConfigurer {
    public void configureMessageBroker(MessageBrokerRegistry config) {

        // This is the prefix for the "radio frequencies" the frontend will listen to
        config.enableSimpleBroker("/topic");

        config.setApplicationDestinationPrefixes("/app");
    }

    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // This is the actual url the frontend uses to connect to the WebSocket server
        registry.addEndpoint("/ws-nexus")
                .setAllowedOriginPatterns("*")
                .withSockJS();// Fallback for older browsers

    }

}
