"use client";

import React, { useEffect, useState } from "react";

const ERROR_PAGE_CSS = `
  @import url('https://fonts.googleapis.com/css?family=Anton|Passion+One|PT+Sans+Caption');

  .fzk-error-page {
    font-family: 'PT Sans Caption', sans-serif, 'arial', 'Times New Roman';
    background: white;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .error .clip .shadow { height: 180px; overflow: hidden; }
  .error .clip:nth-of-type(2) .shadow { width: 130px; }
  .error .clip:nth-of-type(1) .shadow,
  .error .clip:nth-of-type(3) .shadow { width: 250px; }
  .error .digit {
    width: 150px; height: 150px; line-height: 150px;
    font-size: 120px; font-weight: bold;
  }
  .error h2 { font-size: 32px; color: #A2A2A2; font-weight: bold; padding-bottom: 20px; text-align: center; margin-top: 30px; }
  .error .msg {
    top: -190px; left: 30%; width: 80px; height: 80px;
    line-height: 80px; font-size: 32px;
    position: relative; z-index: 9999; display: block;
    background: #535353; color: #A2A2A2; border-radius: 50%;
    font-style: italic; text-align: center;
  }
  .error span.triangle {
    top: 70%; right: 0%;
    border-left: 20px solid #535353;
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
    position: absolute; z-index: 999; transform: rotate(45deg);
    content: ''; width: 0; height: 0;
  }
  .error .container-error-404 {
    position: relative; height: 250px; padding-top: 40px; text-align: center;
  }
  .error .container-error-404 .clip {
    display: inline-block; transform: skew(-45deg);
  }
  .error .clip:nth-of-type(2) .shadow {
    position: relative;
    box-shadow: inset 20px 0px 20px -15px rgba(150,150,150,0.8), 20px 0px 20px -15px rgba(150,150,150,0.8);
  }
  .error .clip:nth-of-type(3) .shadow:after,
  .error .clip:nth-of-type(1) .shadow:after {
    content: ''; position: absolute; right: -8px; bottom: 0px; z-index: 9999;
    height: 100%; width: 10px;
    background: linear-gradient(90deg, transparent, rgba(173,173,173,0.8), transparent);
    border-radius: 50%;
  }
  .error .clip:nth-of-type(3) .shadow:after { left: -8px; }
  .error .digit {
    position: relative; top: 8%; color: white; background: #07B3F9;
    border-radius: 50%; display: inline-block; transform: skew(45deg); text-align: center;
  }
  .error .clip:nth-of-type(2) .digit { left: -10%; }
  .error .clip:nth-of-type(1) .digit { right: -20%; }
  .error .clip:nth-of-type(3) .digit { left: -20%; }
  @media(max-width: 767px) {
    .error .clip .shadow { height: 100px; }
    .error .clip:nth-of-type(2) .shadow { width: 80px; }
    .error .clip:nth-of-type(1) .shadow,
    .error .clip:nth-of-type(3) .shadow { width: 100px; }
    .error .digit { width: 80px; height: 80px; line-height: 80px; font-size: 52px; }
    .error h2 { font-size: 24px; padding: 0 20px; }
    .error .msg { top: -110px; left: 15%; width: 40px; height: 40px; line-height: 40px; font-size: 18px; }
    .error span.triangle { top: 70%; right: -3%; border-left: 10px solid #535353; border-top: 8px solid transparent; border-bottom: 8px solid transparent; }
    .error .container-error-404 { height: 150px; }
  }
`;

export default function NotFound() {
  const [firstDigit, setFirstDigit] = useState<number | string>("");
  const [secondDigit, setSecondDigit] = useState<number | string>("");
  const [thirdDigit, setThirdDigit] = useState<number | string>("");
  const [errorText, setErrorText] = useState("Sorry! Something went wrong");

  useEffect(() => {
    // Number Animation Logic
    const time = 30;
    const randomNum = () => Math.floor(Math.random() * 9) + 1;

    let i3 = 0;
    const loop3 = setInterval(() => {
      if (i3 > 40) {
        clearInterval(loop3);
        setThirdDigit(4);
      } else {
        setThirdDigit(randomNum());
        i3++;
      }
    }, time);

    let i2 = 0;
    const loop2 = setInterval(() => {
      if (i2 > 80) {
        clearInterval(loop2);
        setSecondDigit(0);
      } else {
        setSecondDigit(randomNum());
        i2++;
      }
    }, time);

    let i1 = 0;
    const loop1 = setInterval(() => {
      if (i1 > 100) {
        clearInterval(loop1);
        setFirstDigit(4);
      } else {
        setFirstDigit(randomNum());
        i1++;
      }
    }, time);

    // Smart Error Detection
    const detectErrorType = () => {
      if (typeof window === "undefined") return "Sorry! Page Not Found";
      const url = window.location.href.toLowerCase();

      // 🌐 Network Error (Offline)
      if (!navigator.onLine) {
        return "Sorry! Network Error — Please check your internet connection";
      }
      // 📦 Product Not Found
      if (url.includes("product") || url.includes("item")) {
        return "Sorry! Product Not Found — This item may be unavailable";
      }
      // 🔍 Search Empty Result
      if (url.includes("search") || url.includes("q=")) {
        return "Sorry! No Results Found — Try different keywords";
      }
      // 🔐 Unauthorized / Login Required
      if (url.includes("login-required") || url.includes("unauthorized")) {
        return "Sorry! Access Denied — Please login to continue";
      }
      // ⚙️ Server Error (simulate using status if available)
      if (document.title.includes("500")) {
        return "Sorry! Server Error — Please try again later";
      }
      
      const errorCode = (window as any).ERROR_CODE;
      if (errorCode === 403) return "Sorry! Access Denied — Please login to continue";
      if (errorCode === 500) return "Sorry! Server Error — Please try again later";
      if (errorCode === 0) return "Sorry! Network Error — Please check your internet connection";

      // 📄 Default 404
      return "Sorry! Page Not Found";
    };

    setErrorText(detectErrorType());

    return () => {
      clearInterval(loop1);
      clearInterval(loop2);
      clearInterval(loop3);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ERROR_PAGE_CSS }} />

      <div className="fzk-error-page">
        <div className="error">
          <div className="container-fluid">
            <div className="col-xs-12 text-center ground-color">
              <div className="container-error-404">
                <div className="clip"><div className="shadow"><span className="digit thirdDigit">{thirdDigit}</span></div></div>
                <div className="clip"><div className="shadow"><span className="digit secondDigit">{secondDigit}</span></div></div>
                <div className="clip"><div className="shadow"><span className="digit firstDigit">{firstDigit}</span></div></div>
                <div className="msg">OH!<span className="triangle"></span></div>
              </div>
              <h2 className="h1"><span id="errorText">{errorText}</span></h2>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
