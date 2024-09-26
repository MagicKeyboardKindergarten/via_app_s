// Create WebSocket connection.
let socket : WebSocket;
let isconnect:boolean = false;
let ws_read_array = new Uint8Array(33);
let read_flag = false;

function open()
{
    socket = new WebSocket("ws://localhost:2002");
    // Connection opened
    socket.addEventListener("open", function (event) {
        const receivedData = new Uint8Array(11);
        receivedData[0] = 1;
        socket.send(receivedData);
        isconnect = true;
        read_flag = false;
    });
    // Connection opened
    socket.addEventListener("close", function (event) {
        isconnect = false;
        read_flag = false;
        console.log("werbsocket close",event);
    });
    // Connection opened
    socket.addEventListener("error", function (event) {
        isconnect = false;
        read_flag = false;
        console.log("werbsocket error",event);
    });
    
    // Listen for messages
    socket.addEventListener("message", function (event) {
        const data = event.data; // 获取接收到的数据
        // 判断数据是否为 Blob 类型
        if (data instanceof Blob) {
            // 这是一个 Blob 对象
            const blob: Blob = data;

            // 使用 FileReader 将 Blob 转换为 ArrayBuffer
            const reader = new FileReader();
            reader.onload = function () {
                const arrayBuffer: ArrayBuffer = reader.result as ArrayBuffer;
                const uint8Array: Uint8Array = new Uint8Array(arrayBuffer);

                // 将 Uint8Array 转换为十六进制字符串
                const hexString: string = Array.from(uint8Array)
                    .map(byte => byte.toString(16).padStart(2, '0')) // 转换为十六进制，并补全为两位数
                    .join(' ');

                ws_read_array = uint8Array;
                read_flag = true;

                console.log("websocket read (hex):", hexString); // 输出十六进制表示的数据
            };

            // 将 Blob 读取为 ArrayBuffer
            reader.readAsArrayBuffer(blob);
        } else {
            console.warn("接收到的数据不是 Blob 类型:", data);
        }
    });
} 

function send_string(data:string)
{
    if(isconnect == false)
    {
        return new Error("服务器没有连接");
    }
    socket.send(data);
}
function send_hexs(data:Uint8Array)
{
    if(isconnect == false)
    {
        return new Error("服务器没有连接");
    }
    socket.send(data);
}
function read() :Promise<Uint8Array> {
    return new Promise((resolve) => {
        const checkFlag = setInterval(() => {
            if (read_flag) {
                read_flag = false;
                clearInterval(checkFlag); // 停止轮询
                resolve(ws_read_array); // 通过 resolve 返回 ws_read_array
            }
        }, 100); // 每隔 100ms 检查一次
    });
}

export default{
    open, send_string,send_hexs, read
}