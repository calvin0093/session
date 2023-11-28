
class SocketController {
    constructor(io) {
        this.io = io;

        // Sự kiện connection
        this.io.on("connection", this.onConnection);

        // Sự kiện message
        this.io.on("dataFromClient", this.onMessage);

        this.io.emit("dataFromServer", this.sendMessage)
    }

    // Sự kiện connection
    onConnection(socket) {
        console.log("Người dùng mới kết nối");
        socket.on("dataFromClient", data=>{
            console.log("???");
            console.log(data);
        })
    }

    // Sự kiện message
    onMessage(socket, data) {
        // socket.emit(socket,data)
        console.log("hello onmessage");
        console.log(data);
        console.log(socket);

        // Gửi dữ liệu cho client
        // socket.emit("dataFromServer", "Hello client");
    }
    sendMessage(socket,data){
        socket.emit("dataFromServer", "hello")
        console.log(socket);
        console.log(data);
    }
}
module.exports =  SocketController 