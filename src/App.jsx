

import './App.css';
import CodeMirror from "@uiw/react-codemirror";
import React, { useEffect, useState, useRef } from "react";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { draculaInit } from "@uiw/codemirror-theme-dracula";
import { tags as t } from "@lezer/highlight";
import { autocompletion, completeFromList } from "@codemirror/autocomplete";
import { EditorView } from '@codemirror/view';
import background from "./border-from-red-paint.png"

function App() {
  
  const cKeywords = [
    { label: "#include", type: "keyword" },
    { label: "int", type: "keyword" },
    { label: "float", type: "keyword" },
    { label: "char", type: "keyword" },
    { label: "return", type: "keyword" },
    { label: "printf", type: "function" },
    { label: "scanf", type: "function" },
    { label: "main", type: "function" },
  ];

  const [difficulty, setDifficulty] = useState('Easy');
  const [code, setCode] = useState('');
  const codeRef = useRef('');
  const [totalTime, setTotalTime] = useState(180); // Easy default 45 seconds
  const [disabled, setDisabled] = useState(true);
  const [scrambleCount, setScrambleCount] = useState(0);
  const [bgOpacity, setBgOpacity] = useState(0); // Track background opacity
  const [bgBlink, setBgBlink] = useState(''); 
  const [infectionTime, setInfectionTime] = useState(30000);

  // Scramble the code at regular intervals
  useEffect(() => {
    if (!disabled) {
      const scrambleTimer = setInterval(() => {
        infectCode();
      }, infectionTime); // Scrambles every 10 seconds

      return () => clearInterval(scrambleTimer);
    }
  }, [disabled,infectionTime]);

  // Countdown timer for total game time
  useEffect(() => {
    if (totalTime > 0 && !disabled) {
      const countdownTimer = setTimeout(() => {
        setTotalTime(totalTime - 1);

        // Start blinking when there are 10 seconds left
        if (totalTime === 11) {
          blink(); // Call blink function when there's 10 seconds remaining
        }
      }, 1000);
      
      return () => clearTimeout(countdownTimer);
    }

    if (totalTime === 0) {
      setDisabled(true); // Stop the game when time reaches zero
    }
  }, [totalTime, disabled]);

  // Scramble code logic
  const infectCode = () => {
    if (codeRef.current.trim() !== '') {
      let scrambledCode = scrambleCode(codeRef.current);
      setCode(scrambledCode);
      codeRef.current = scrambledCode;

      // Use functional update to ensure correct scramble count
      setScrambleCount((prevCount) => {
        let newCount = prevCount + 1;

        // Adjust background opacity based on scramble count
        if (newCount === 1) setBgOpacity(0.7);
        else if (newCount === 2) setBgOpacity(0.8);
        else if (newCount === 3) setBgOpacity(0.9);
        else if (newCount >= 4) setBgOpacity(1);

        return newCount;
      });
    }
  };

  // Handle code changes
  const handleChange = (value) => {
    setCode(value);
    codeRef.current = value;
  };

  // Scramble lines in the code
  const scrambleCode = (code) => {
    let lines = code.split('\n');
    if (lines.length === 0) return code;
    let shuffled = shuffleArray(lines);
    // blink();
    return shuffled.join('\n');
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Start the game based on difficulty
  const startGame = () => {
    setDisabled(false);
    setScrambleCount(0); // Reset scramble count
    setBgOpacity(0); // Reset background opacity
    setTotalTime(difficulty === 'Easy' ? 180 : difficulty === 'Medium' ? 150 : 120); // Set time based on difficulty
  };

  // Apply the background color based on scramble count (red with increasing opacity)
  useEffect(() => {
    document.body.style.backgroundColor = `rgba(255, 0, 0, ${bgOpacity})`;
  }, [bgOpacity]);
  
  const blink = () => {
    let isRed = false;

    // Set the interval to alternate between red and white every 200ms
    const blinkInterval = setInterval(() => {
      // Toggle the background color
      document.body.style.backgroundColor = isRed ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 0, 0, 1)';
      isRed = !isRed; // Switch color state
    }, 200); // 200ms interval for blinking effect

    // Stop blinking after 10 seconds or when time ends
    setTimeout(() => {
      clearInterval(blinkInterval); // Clear the interval to stop blinking
      document.body.style.backgroundColor = 'rgba(255, 0, 0, 1)'; // Reset to red
    }, 10000);
  };

  return (
    <div>
      <main className="flex justify-center items-center flex-col" style={{backgroundImage: `url(${background})`,backgroundSize:"cover"}}>
        <div className="mt-3 bg-white p-3" style={{background:"rgba(0,0,0,0.1)",borderRadius:"20px"}}>
            <div className="flex justify-center items-center gap-11 mt-5">
                <button className="flex justify-center items-center rounded-md  min-w-[100px] cursor-pointer text-white bg-black" onClick={() => {setDifficulty("Easy"); setTotalTime(180); setInfectionTime(30000)}}>Easy</button>
                <button className="flex justify-center items-center rounded-md min-w-[100px] cursor-pointer text-white bg-black" onClick={() => {setDifficulty("Medium"); setTotalTime(150); setInfectionTime(25000)}}>Medium</button>
                <button className="flex justify-center items-center rounded-md min-w-[100px] cursor-pointer text-white bg-black" onClick={() => {setDifficulty("Hard"); setTotalTime(120); setInfectionTime(20000)}}>Hard</button>
              </div>
              <div className="flex justify-center items-center font-bold pt-5">Difficulty: {difficulty}</div>
              <div className="flex justify-center items-center mt-5">Time Left: {totalTime}s</div>
              <button className="mt-5 border-2 border-black hover:text-white hover:bg-black min-w-[100px] rounded-md" style={{marginLeft:"140px"}} onClick={startGame}>Start</button>
        </div>
        
        <div className="flex justify-center items-center mt-5">
          <CodeMirror
            value={code}
            height="70vh"
            width="70vw"
            extensions={[
              loadLanguage("c"),
              autocompletion({
                override: [completeFromList(cKeywords)],
              }),
              EditorView.editable.of(!disabled),
            ]}
            onChange={handleChange}
            theme={draculaInit({
              settings: {
                caret: "#c6c6c6",
                fontFamily: "monospace",
              },
              styles: [{ tag: t.comment, color: "#6272a4", width: "100%" }],
            })}
          />
        </div>
      </main>
    </div>
  );
}

export default App;

