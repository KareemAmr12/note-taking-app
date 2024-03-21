import { useState, useRef } from "react";

export default function Note(props) {
  const [mentions, setMentions] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const userMentionIndex = useRef(-2);

  function HandleMentions(e) {
    if (e.target.value[e.target.value.length - 1] === "@" && !showMentions) {
      userMentionIndex.current = e.target.value.length;
      setShowMentions(true);
    }

    if (
      (e.target.value[e.target.value.length - 1] === " " ||
        e.target.value[userMentionIndex.current - 1] !== "@") &&
      showMentions
    ) {
      userMentionIndex.current = -2;
      setShowMentions(false);
      setMentions([]);
    }
    if (showMentions) {
      const userMentionInput = e.target.value
        .slice(userMentionIndex.current)
        .toLowerCase();
      if (userMentionInput !== "") {
        const matches = props.allUsers.current.filter((user) =>
          user.toLowerCase().includes(userMentionInput)
        );
        matches.sort((a, b) => {
          const relevanceA = a.includes(userMentionInput)
            ? a.indexOf(userMentionInput)
            : Infinity;
          const relevanceB = b.includes(userMentionInput)
            ? b.indexOf(userMentionInput)
            : Infinity;
          return relevanceA - relevanceB;
        });

        setMentions(matches.slice(0, 5));
      } else {
        setMentions([]);
      }
    }
  }

  function ChangeNoteDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Add leading zero if needed
    const day = ("0" + currentDate.getDate()).slice(-2); // Add leading zero if needed
    const hours = ("0" + currentDate.getHours()).slice(-2); // Add leading zero if needed
    const minutes = ("0" + currentDate.getMinutes()).slice(-2); // Add leading zero if needed
    const seconds = ("0" + currentDate.getSeconds()).slice(-2); // Add leading zero if needed

    const formattedDateTime = `${hours}:${minutes}:${seconds} ${month}/${day}/${year}`;
    return formattedDateTime;
  }

  return (
    <div key={props.note.id} className="note">
      <textarea
        className="note-title"
        placeholder="Title"
        maxLength={18}
        value={props.note.title}
        onChange={(e) => {
          props.HandleUpdateNote(
            props.note.id,
            e.target.value,
            props.note.body,
            ChangeNoteDate()
          );
        }}
      />
      <textarea
        className="note-body"
        placeholder="Start writing..."
        value={props.note.body}
        onChange={(e) => {
          HandleMentions(e);
          props.HandleUpdateNote(
            props.note.id,
            props.note.title,
            e.target.value,
            ChangeNoteDate()
          );
        }}
        autoFocus={true}
        maxLength={1000}
        wrap="hard"
      />
      <button
        className="del-note-button"
        onClick={() => props.HandleDeleteNote(props.note.id)}
      >
        X
      </button>
      {props.note.lastUpdated ? (
        <span className="note-date">Last update: {props.note.lastUpdated}</span>
      ) : (
        <span className="note-date"></span>
      )}
      {showMentions && (
        <select
          disabled={!showMentions}
          className="mention-list"
          onChange={(e) => {
            const oldBody = props.note.body.slice(0, userMentionIndex.current);
            const newBody = oldBody + e.target.value;
            userMentionIndex.current = -2;
            setShowMentions(false);
            setMentions([]);
            props.HandleUpdateNote(
              props.note.id,
              props.note.title,
              newBody,
              ChangeNoteDate()
            );
          }}
        >
          <option className="mentions-list" value={" "}>
            Select mention
          </option>
          {mentions.map((mention) => {
            return <option value={mention}>@{mention}</option>;
          })}
        </select>
      )}
    </div>
  );
}
