
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL as string, {
  withCredentials: true,
});

export default socket;
