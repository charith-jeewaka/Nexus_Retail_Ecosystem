let stompClient = null;

$(document).ready(function () {
    // check the role
    let userRole = localStorage.getItem("nexus_role");
    console.log(userRole);
    if(userRole === "ADMIN" || userRole === "CASHIER") {
        connectToOrderRadio();

    }
});

function connectToOrderRadio() {
    //connect to the endpoint we created in spring boot
    let socket = new SockJS('http://localhost:8080/ws-nexus');
    stompClient = Stomp.over(socket);

    //avoid the big debug text in console
    // stompClient.debug = null;

    //start the connection
    stompClient.connect({},function (frame){
        console.log("Connected to live orders");

        //tune into the specific frequency we brodcasted
        stompClient.subscribe('/topic/orders',function (message){

            // This block runs EVERY SINGLE TIME a customer clicks "Checkout"
            // message.body will look like: "NEW_ORDER:45
            handleIncomingAlert(message.body);
        });
    }, function (error) {
        console.error("Websocket Connection lost Reconnecting in 5 seconds...",setTimeout(connectToOrderRadio, 5000));
    });
}

function handleIncomingAlert(payload) {
    if (payload.startsWith("NEW_ORDER:")) {
        // Extract the ID from the string
        let orderId = payload.split(":")[1];

        // 1. Play a professional POS "Ding" sound
        playPingSound();

        // 2. Show a beautiful Toast Notification that doesn't interrupt their work
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: '🔥 New Order Arrived!',
            text: `Order #${orderId} is pending.`,
            showConfirmButton: true,
            confirmButtonText: 'View',
            confirmButtonColor: '#0d6efd',
            timer: 8000 // Stays on screen for 8 seconds
        }).then((result) => {
            if (result.isConfirmed) {
                // If they click "View", navigate them to the Orders page!
                // window.navigateAdmin('orders');
            }
        });

        // 3. THE MAGIC TRICK: Refresh the Admin's Data Table instantly!
        // If they are currently looking at the orders page, refresh it so the new order appears!
        // if (typeof loadAdminOrders === "function") {
        //     loadAdminOrders();
        // }
    }
}

function playPingSound() {
    // A clean, professional notification chime
    let audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    // Browsers sometimes block autoplay audio, so we catch the error silently
    audio.play().catch(e => console.log("Audio auto-play blocked by browser settings."));
}