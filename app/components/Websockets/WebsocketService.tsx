class WebSocketService {
    reportSocket: WebSocket | null;
    reportUrl: string | URL;
    fileSocket: WebSocket | null;
    fileUrl: string;
    notificationSocket: WebSocket | null;
    notificationUrl: string;
    constructor() {
      this.reportSocket = null;
      this.fileSocket = null;
      this.notificationSocket = null;
      this.reportUrl = import.meta.env.VITE_WEBSOCKET_URL + '/ws/reports';
      this.fileUrl =  import.meta.env.VITE_WEBSOCKET_URL + '/ws/files';
      this.notificationUrl = import.meta.env.VITE_WEBSOCKET_URL + '/ws/reportAlerts';
    }

    // Connect to the websocket server

    connectNotificationSocket(userId, onMessageCallback) {
      this.notificationSocket = new WebSocket(this.notificationUrl);
  
      this.notificationSocket.onopen = () => {
        console.log('Notification WebSocket connected');
        this.notificationSocket.send(JSON.stringify({ userId }));
      };
      
      // Keep alive ping
      const sendPing = () => {
        if (this.notificationSocket.readyState === WebSocket.OPEN) {
          this.notificationSocket.send(JSON.stringify({ userId: 'ping' }));
        }
      };
      const pingInterval = setInterval(sendPing, 50000);

  
      this.notificationSocket.onmessage = (event) => {
        if (event.data === 'pong') {
          //console.log("Received: " + event.data)
          return;
        }
        //console.log('Notification WebSocket message received:', event.data);
        onMessageCallback(JSON.parse(event.data));
      };
  
      this.notificationSocket.onclose = () => {
        console.log('Notification WebSocket connection closed.');
        clearInterval(pingInterval);
        //setTimeout(() => this.connectNotificationSocket(userId, onMessageCallback), 1000);
      };
  
      this.notificationSocket.onerror = (error) => {
        console.error('Notification WebSocket error:', error);
        clearInterval(pingInterval);
        setTimeout(() => this.connectNotificationSocket(userId, onMessageCallback), 1000);
      };
    }
  
    connectReportSocket(applicationId, onMessageCallback) {
      this.reportSocket = new WebSocket(this.reportUrl);
  
      this.reportSocket.onopen = () => {
       //console.log('Connected to report WebSocket server');
        this.reportSocket.send(JSON.stringify({ applicationId }));
      };
  
      this.reportSocket.onmessage = (event) => {
        onMessageCallback(JSON.parse(event.data));
      };
  
      this.reportSocket.onclose = () => {
        //console.log('Report WebSocket connection closed.');
        //setTimeout(() => this.connectReportSocket(applicationId, onMessageCallback), 1000);
      };
  
      this.reportSocket.onerror = (error) => {
        console.error('Report WebSocket error:', error);
        setTimeout(() => this.connectReportSocket(applicationId, onMessageCallback), 1000);
      };
    }
  
    connectFileSocket(applicantId, onMessageCallback) {
      //console.log('Connecting to file WebSocket server:' + applicantId);
      this.fileSocket = new WebSocket(this.fileUrl);
  
      this.fileSocket.onopen = () => {
        //console.log('Connected to file WebSocket server');
        this.fileSocket.send(JSON.stringify({ applicantId }));
      };
  
      this.fileSocket.onmessage = (event) => {
        onMessageCallback(JSON.parse(event.data));
      };
  
      this.fileSocket.onclose = () => {
        //console.log('File WebSocket connection closed.');
        //setTimeout(() => this.connectFileSocket(applicantId, onMessageCallback), 1000);
      };
  
      this.fileSocket.onerror = (error) => {
        console.error('File WebSocket error:', error);
        setTimeout(() => this.connectFileSocket(applicantId, onMessageCallback), 1000);
      };
    }

    // Send messages to the websocket

    sendMessageToNotificationSocket(message) {
      if (this.notificationSocket && this.notificationSocket.readyState === WebSocket.OPEN) {
        this.notificationSocket.send(JSON.stringify(message));
      }
    }
  
    sendMessageToReportSocket(message) {
      if (this.reportSocket && this.reportSocket.readyState === WebSocket.OPEN) {
        this.reportSocket.send(JSON.stringify(message));
      }
    }
  
    sendMessageToFileSocket(message) {
      if (this.fileSocket && this.fileSocket.readyState === WebSocket.OPEN) {
        this.fileSocket.send(JSON.stringify(message));
      }
    }

    // Close the websocket connections
    closeReportSocket() {
      this.reportSocket.close();
    }

    closeFileSocket() {
      this.fileSocket.close();
    }

    closeNotificationSocket() {
      this.notificationSocket.close();
    }
  }
  
  export default WebSocketService;
  