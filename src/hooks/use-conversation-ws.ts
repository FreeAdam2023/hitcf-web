"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getWSToken } from "@/lib/api/speaking-conversation";
import type { WSServerMessage } from "@/lib/api/types";

interface TurnPayload {
  user_text: string;
  pronunciation_scores?: Record<string, number> | null;
  word_scores?: Array<{ word: string; accuracy: number; errorType: string }>;
}

interface UseConversationWSCallbacks {
  onStreamStart?: () => void;
  onStreamDelta?: (text: string) => void;
  onStreamEnd?: (fullText: string, turnCount: number) => void;
  onEnded?: () => void;
  onEvaluationDone?: () => void;
  onError?: (code: string, detail: string) => void;
}

interface UseConversationWSReturn {
  isConnected: boolean;
  isStreaming: boolean;
  streamingText: string;
  connect: () => Promise<void>;
  sendBegin: (sessionId: string) => void;
  sendTurn: (data: TurnPayload) => void;
  sendEnd: (locale?: string) => void;
  disconnect: () => void;
  connectionFailed: boolean;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const PING_INTERVAL_MS = 25_000;
const PONG_TIMEOUT_MS = 10_000;

export function useConversationWS(
  callbacks: UseConversationWSCallbacks,
): UseConversationWSReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [connectionFailed, setConnectionFailed] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const wsUrlRef = useRef<string>("");
  const tokenRef = useRef<string>("");
  const reconnectAttempts = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedIntentionally = useRef(false);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const streamingTextRef = useRef("");

  const cleanup = useCallback(() => {
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
    if (pongTimerRef.current) {
      clearTimeout(pongTimerRef.current);
      pongTimerRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const startPing = useCallback(() => {
    if (pingTimerRef.current) clearInterval(pingTimerRef.current);
    pingTimerRef.current = setInterval(() => {
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
        pongTimerRef.current = setTimeout(() => {
          // No pong received — force reconnect
          ws.close();
        }, PONG_TIMEOUT_MS);
      }
    }, PING_INTERVAL_MS);
  }, []);

  const connectWS = useCallback(
    (url: string, token: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send auth message
        ws.send(JSON.stringify({ type: "auth", token }));
      };

      ws.onmessage = (event) => {
        let msg: WSServerMessage;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }

        switch (msg.type) {
          case "auth_ok":
            setIsConnected(true);
            reconnectAttempts.current = 0;
            startPing();
            break;

          case "auth_error":
            setConnectionFailed(true);
            cleanup();
            ws.close();
            break;

          case "pong":
            if (pongTimerRef.current) {
              clearTimeout(pongTimerRef.current);
              pongTimerRef.current = null;
            }
            break;

          case "stream_start":
            setIsStreaming(true);
            streamingTextRef.current = "";
            setStreamingText("");
            callbacksRef.current.onStreamStart?.();
            break;

          case "stream_delta":
            streamingTextRef.current += msg.text;
            setStreamingText(streamingTextRef.current);
            callbacksRef.current.onStreamDelta?.(msg.text);
            break;

          case "stream_end":
            setIsStreaming(false);
            setStreamingText("");
            streamingTextRef.current = "";
            callbacksRef.current.onStreamEnd?.(msg.full_text, msg.turn_count);
            break;

          case "ended":
            callbacksRef.current.onEnded?.();
            break;

          case "evaluation_done":
            callbacksRef.current.onEvaluationDone?.();
            break;

          case "error":
            setIsStreaming(false);
            callbacksRef.current.onError?.(msg.code, msg.detail);
            break;
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        cleanup();

        if (closedIntentionally.current) return;

        // Attempt reconnect with exponential backoff
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            8000,
          );
          reconnectAttempts.current++;
          reconnectTimerRef.current = setTimeout(() => {
            // Get a fresh token for reconnection
            getWSToken()
              .then(({ token: newToken, ws_url: newUrl }) => {
                connectWS(newUrl, newToken);
              })
              .catch(() => {
                setConnectionFailed(true);
              });
          }, delay);
        } else {
          setConnectionFailed(true);
        }
      };

      ws.onerror = () => {
        // onclose will fire after this — reconnect logic lives there
      };
    },
    [cleanup, startPing],
  );

  const connect = useCallback(async () => {
    closedIntentionally.current = false;
    setConnectionFailed(false);
    reconnectAttempts.current = 0;

    try {
      const { token, ws_url } = await getWSToken();
      wsUrlRef.current = ws_url;
      tokenRef.current = token;
      connectWS(ws_url, token);
    } catch {
      setConnectionFailed(true);
    }
  }, [connectWS]);

  const sendBegin = useCallback((sessionId: string) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "begin", session_id: sessionId }));
    }
  }, []);

  const sendTurn = useCallback((data: TurnPayload) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "turn", ...data }));
    }
  }, []);

  const sendEnd = useCallback((locale?: string) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "end", locale: locale || "zh" }));
    }
  }, []);

  const disconnect = useCallback(() => {
    closedIntentionally.current = true;
    cleanup();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsStreaming(false);
    setStreamingText("");
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closedIntentionally.current = true;
      cleanup();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [cleanup]);

  return {
    isConnected,
    isStreaming,
    streamingText,
    connect,
    sendBegin,
    sendTurn,
    sendEnd,
    disconnect,
    connectionFailed,
  };
}
