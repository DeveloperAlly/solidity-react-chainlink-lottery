import React from "react";
import ReactPlayer from "react-player";

const ErrorPage = () => {
  return (
    <>
      <h3>Sorry - an error occurred!</h3>
      <p>Try again or just enjoy this video!</p>
      <ReactPlayer
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        // playing={true}
        // muted={true}
        controls={true}
      />
    </>
  );
};

export default ErrorPage;
