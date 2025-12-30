import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Peer from "simple-peer";

// Force WebSocket only
const socket = io("http://localhost:5001", {
  transports: ["websocket", "polling"],
});

const VideoRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [stream, setStream] = useState(null);
  const [me, setMe] = useState("");
  const [call, setCall] = useState({});
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [cameraError, setCameraError] = useState(null);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    //Get Camera Permissions immediately
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.error("Camera Error:", err);
        setCameraError(
          "Camera blocked or missing! Please allow camera access in browser."
        );
      });

    //Handle Socket Events
    socket.on("connect", () => {
      console.log("Connected to Socket Server!", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket Connection Failed:", err);
      alert("Could not connect to server. Is Backend running on Port 5001?");
    });

    socket.on("me", (id) => setMe(id));

    socket.on("calluser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });

    // Cleanup
    return () => {
      socket.off("calluser");
      socket.off("me");
    };
  }, []);

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on("signal", (data) =>
      socket.emit("answercall", { signal: data, to: call.from })
    );
    peer.on("stream", (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });
    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  const callUser = (id) => {
    if (!id) return alert("Please enter an ID to call!");
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on("signal", (data) =>
      socket.emit("calluser", {
        userToCall: id,
        signalData: data,
        from: me,
        name,
      })
    );
    peer.on("stream", (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });
    socket.on("callaccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) connectionRef.current.destroy();
    navigate("/dashboard");
    window.location.reload();
  };

  return (
    <div
      style={{
        textAlign: "center",
        background: "#202124",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
      }}
    >
      <h2>Meeting Room: {roomId}</h2>
      {cameraError && (
        <h3 style={{ color: "red", background: "white" }}>{cameraError}</h3>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {/*MY VIDEO*/}
        <div style={{ position: "relative" }}>
          {stream ? (
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              style={{
                width: "400px",
                borderRadius: "10px",
                transform: "scaleX(-1)",
                border: "2px solid green",
              }}
            />
          ) : (
            <div
              style={{
                width: "400px",
                height: "300px",
                background: "black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p>Loading Camera...</p>
            </div>
          )}
          <p>You {me ? `(ID: ${me})` : "(Connecting...)"}</p>
        </div>
        {/*REMOTE VIDEO*/}
        {callAccepted && !callEnded && (
          <div style={{ position: "relative" }}>
            <video
              playsInline
              ref={userVideo}
              autoPlay
              style={{
                width: "400px",
                borderRadius: "10px",
                border: "2px solid blue",
              }}
            />
            <p>Remote User</p>
          </div>
        )}
      </div>
      {/*CONTROLS*/}
      <div
        style={{
          background: "#333",
          padding: "20px",
          borderRadius: "10px",
          display: "inline-block",
          maxWidth: "600px",
        }}
      >
        {!me ? (
          <p style={{ color: "orange" }}>
            Connecting to server... Please wait.
          </p>
        ) : (
          <div
            style={{
              marginBottom: "15px",
              background: "#444",
              padding: "10px",
            }}
          >
            <p style={{ margin: 0, fontSize: "14px", color: "#aaa" }}>
              Your Socket ID (Share this):
            </p>
            <code
              style={{
                fontSize: "18px",
                color: "#4caf50",
                fontWeight: "bold",
                display: "block",
                margin: "5px 0",
              }}
            >
              {me}
            </code>
          </div>
        )}

        {call.isReceivingCall && !callAccepted && (
          <div
            style={{
              background: "#2e7d32",
              padding: "15px",
              borderRadius: "5px",
              marginBottom: "20px",
              animation: "pulse 1s infinite",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0" }}>📞 Incoming Call...</h3>
            <button
              onClick={answerCall}
              style={{
                padding: "10px 30px",
                background: "white",
                color: "green",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Answer
            </button>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Paste Partner's ID here..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: "12px",
              width: "250px",
              borderRadius: "5px",
              border: "none",
            }}
          />
          <button
            onClick={() => callUser(name)}
            style={{
              padding: "12px 20px",
              background: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Call ID
          </button>
        </div>

        <button
          onClick={leaveCall}
          style={{
            marginTop: "20px",
            padding: "10px 30px",
            background: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          End Meeting
        </button>
      </div>
    </div>
  );
};

export default VideoRoom;
