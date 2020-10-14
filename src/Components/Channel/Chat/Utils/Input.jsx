import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import autosize from 'autosize';
import {
  sendmessage,
  TypingIndication,
} from '../../../../Store/Actions/Message';
import Styles from '../../../../Styles/responsive.module.css';

function Input({ sendMessage, indicateMessage, emoji, typingIndication }) {
  const [message, setMessage] = useState('');
  const [indicate, setIndicate] = useState('');

  const { id } = useParams();

  const Textarea = useRef(null);

  useEffect(() => {
    autosize(Textarea.current);
  }, []);

  useEffect(() => {
    if (emoji === '') return;
    setMessage((m) => `${m} ${emoji.emoji}`);
  }, [emoji]);

  useEffect(() => {
    const handlePress = () => {
      Textarea.current.focus();
    };
    window.addEventListener('keypress', handlePress);
    return () => window.removeEventListener('keypress', handlePress);
  }, []);

  const handleChange = ({ target }) => {
    const parsed = target.value.trim();
    if (parsed.length >= 10) indicateMessage(id, 'CONTENT');
    if (parsed === '') {
      setIndicate('NO_CONTENT');
      indicateMessage(id, 'NO_CONTENT');
      typingIndication({ channel: id, type: 'NO_CONTENT' });
    }
    if (parsed !== '') {
      typingIndication({ channel: id, type: 'CONTENT' });

      setIndicate('CONTENT');
    }

    setMessage(target.value);
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    const parsed = message.trim();
    if (parsed === '' && indicate === 'NO_CONTENT') {
      Textarea.current.focus();
      return;
    }

    const nan = nanoid(25);
    sendMessage(
      {
        message,
        delivered: false,
        read: false,
        stored: true,
        messageId: nan,
        time: Date.now(),
      },
      {
        channel: id,
      },
    );

    // reset everything

    setMessage('');
    Textarea.current.value = '';
    autosize.update(Textarea.current);
    setIndicate('NO_CONTENT');
    Textarea.current.focus();
    typingIndication({ channel: id, type: 'NO_CONTENT' });
    indicateMessage(id, 'NO_CONTENT');
  };

  const handleBlur = () => {
    typingIndication({ channel: id, type: 'NO_CONTENT' });
  };

  const handleKeyPress = (e) => {
    if (!e.ctrlKey && e.charCode === 13 && window.innerWidth >= 768) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.ctrlKey && e.charCode === 13) {
      Textarea.current.value = `${Textarea.current.value} \n`;
      autosize.update(Textarea.current);
    }
  };
  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{
          minHeight: '40px',
          cursor: 'text',
        }}
        className="flex-1 px-1 outline-none ml-1 flex items-center bg-primary"
      >
        <textarea
          style={{
            maxHeight: '90px',
            minHeight: '18px',
            resize: 'none',
            boxSizing: 'border-box',
          }}
          ref={Textarea}
          placeholder="Message"
          rows={1}
          value={message}
          spellCheck="false"
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className={`${Styles.input} text-white text-base`}
        />
      </form>
      <div
        className={`${
          indicate === 'CONTENT' ? 'text-accent' : Styles.gray1
        } mx-2 outline-none flex items-center `}
      >
        <button
          type="submit"
          title="Enter to send "
          onClick={handleSubmit}
          className="outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            className="outline-none"
          >
            <path
              fill="currentColor"
              d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"
            />
          </svg>
        </button>
      </div>
    </>
  );
}

const mapDispatchToProps = (dispatch) => ({
  sendMessage: (message, details) => dispatch(sendmessage(message, details)),
  indicateMessage: (channelId, type) =>
    dispatch({
      type: 'TYPING_INDICATION',
      payload: { channelId, type },
    }),
  typingIndication: (status) => dispatch(TypingIndication(status)),
});

export default connect(null, mapDispatchToProps)(Input);
