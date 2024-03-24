import { useState, useEffect, useRef } from "react";
import Note from "./Note";

export default function NotesList() {
  const [noteList, setNoteList] = useState([]); //holding notes to be displayed
  const [session, setSession] = useState("react");
  const secNoteList = useRef([]); //holding all notes
  const allUsers = useRef([]);
  const [sessionUserInput, setSessionUserInput] = useState("react");
  //const [searchInput, setSearchInput] = useState("");
  const searchInput = useRef("");
  let nextKey = secNoteList.current.length;

  function debounce(func, delay) {
    let timeoutId;

    return function (...args) {
      const context = this;

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    };
  }

  function HandleSearchNotes() {
    const newNoteList = secNoteList.current.filter(
      (note) =>
        note.title.toLowerCase().includes(searchInput.current.toLowerCase()) ||
        note.body.toLowerCase().includes(searchInput.current.toLowerCase())
    );

    setNoteList(newNoteList);
  }

  async function HandleDeleteNote(id) {
    secNoteList.current = secNoteList.current.map((note) => {
      if (note.id === id) {
        return {
          id: id,
          title: "",
          body: "",
          lastUpdated: "NULL",
        };
      } else {
        return note;
      }
    });
    HandleSearchNotes();

    let bodyAfterAdj = "=#=#NULL";
    const noteNewData = {
      body: bodyAfterAdj,
    };
    const URL = "https://challenge.surfe.com/" + session + "/notes/" + id;
    try {
      const response = await fetch(URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteNewData),
      });
      if (!response.ok) {
        throw Error("Failed to update note");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function HandleNewNote() {
    secNoteList.current = [
      ...secNoteList.current,
      { id: nextKey, title: "", body: "", lastUpdated: "" },
    ];
    HandleSearchNotes();
    const noteNewData = {
      body: "=#=#",
    };
    const URL = "https://challenge.surfe.com/" + session + "/notes";
    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(noteNewData),
      });
      if (!response.ok) {
        throw Error("Failed to add note");
      }
    } catch (error) {
      console.log(error);
    }
  }
  async function HandleUpdateNote(id, newTitle, newBody, newLastUpdated) {
    secNoteList.current = secNoteList.current.map((note) => {
      if (note.id === id) {
        return {
          id: id,
          title: newTitle,
          body: newBody,
          lastUpdated: newLastUpdated,
        };
      } else {
        return note;
      }
    });
    HandleSearchNotes();
    let bodyAfterAdj = newTitle + "=#" + newBody + "=#" + newLastUpdated;
    const noteNewData = {
      body: bodyAfterAdj,
    };

    const URL = "https://challenge.surfe.com/" + session + "/notes/" + id;
    try {
      const response = await fetch(URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteNewData),
      });
      if (!response.ok) {
        throw Error("Failed to update note");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const debouncedHandleUpdateNote = debounce(HandleUpdateNote, 500);

  useEffect(() => {
    const GetUsers = async () => {
      try {
        const response = await fetch("https://challenge.surfe.com/users", {
          method: "GET",
        });
        if (!response.ok) {
          throw Error("Failed to get users.");
        }

        const responseData = await response.json();
        allUsers.current = responseData.map((user) => {
          return user.username;
        });
      } catch (error) {
        console.log(error);
      }
    };

    GetUsers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://challenge.surfe.com/" + session + "/notes",
          {
            method: "GET",
          }
        );
        if (!response.ok) {
          throw Error("Failed to fetch data.");
        }
        const responseData = await response.json();
        const notes = responseData.map((entry) => {
          const [title, body, lastUpdated] = entry.body.split("=#");
          return {
            id: entry.id,
            title: title,
            body: body,
            lastUpdated: lastUpdated,
          };
        });
        setNoteList(notes);
        secNoteList.current = notes;
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [session]);

  return (
    <div>
      <label className="session-input">
        Current session username:{" "}
        <input
          placeholder="ex: test123"
          style={{ width: 70 + "px" }}
          maxLength={10}
          onChange={(e) => {
            setSessionUserInput(e.target.value);
          }}
        />{" "}
        <button onClick={() => setSession(sessionUserInput)}>enter</button>
      </label>

      <input
        placeholder="Search..."
        className="search-bar"
        value={searchInput.current}
        onChange={(e) => {
          searchInput.current = e.target.value;
          HandleSearchNotes();
        }}
      />
      <div className="notes-list">
        {noteList.map((note) => {
          if (note.lastUpdated !== "NULL") {
            return (
              <Note
                key={note.id}
                note={note}
                HandleDeleteNote={HandleDeleteNote}
                HandleUpdateNote={debouncedHandleUpdateNote}
                allUsers={allUsers}
              />
            );
          } else return;
        })}
        <button className="new-note" onClick={() => HandleNewNote()}>
          New note
        </button>
      </div>
    </div>
  );
}
