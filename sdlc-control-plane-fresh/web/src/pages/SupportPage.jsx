import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function SupportPage() {
  const [notes, setNotes] = useState([]);
  const [body, setBody] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    const data = await api('/support/notes');
    setNotes(data.notes || []);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!body.trim()) {
      return;
    }

    await api('/support/notes', {
      method: 'POST',
      body: JSON.stringify({
        body,
        author: 'admin',
        noteType: 'internal'
      })
    });

    setBody('');
    setNotice('Support note saved.');
    await load();
  };

  return (
    <>
      {notice ? <div className="notice">{notice}</div> : null}

      <div className="panel">
        <div className="field-row">
          <textarea
            className="textarea"
            rows="4"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Add internal support context"
          />
          <div>
            <button className="action-button" type="button" onClick={save}>
              Save Note
            </button>
          </div>
        </div>
      </div>

      <div className="card-list">
        {notes.map((note) => (
          <div className="card" key={note.id}>
            <h3>{note.noteType}</h3>
            <p className="muted">{note.author}</p>
            <p>{note.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}
