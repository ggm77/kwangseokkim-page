import React from 'react';
import { createPortal } from 'react-dom';
import { getLyrics } from '../data/lyrics';

interface Props {
    isOpen: boolean;
    title: string;
    onClose: () => void;
}

export const LyricsModal: React.FC<Props> = ({ isOpen, title, onClose }) => {
    if (!isOpen) return null;

    const lyrics = getLyrics(title);

    const modalContent = (
        <div className="lyrics-modal-backdrop" onClick={onClose}>
            <div 
                className="lyrics-modal-content glass-effect" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="lyrics-modal-header">
                    <h3 className="lyrics-title">{title}</h3>
                    <button className="retro-btn close-btn" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>
                <div className="lyrics-body">
                    {lyrics.split('\n').map((line, index) => (
                        <p key={index} className="lyrics-line">
                            {line || '\u00A0'}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
