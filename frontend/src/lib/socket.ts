import { io } from "socket.io-client";
import { getRootDomain } from "../utils/getRootDomain";

export const socket = io(getRootDomain());
