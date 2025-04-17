"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  error?: boolean;
}

function Chatbot() {
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Messages dizisi güncellendi:', messages);
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleSendMessage = async () => {
    const trimmedInputText = inputText.trim();
    if (trimmedInputText) {
      const userMessage: Message = { text: trimmedInputText, sender: 'user' };
      console.log('Kullanıcı mesajı gönderiliyor:', userMessage);
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, userMessage];
        console.log('Messages dizisi güncellendi (kullanıcı):', updatedMessages);
        return updatedMessages;
      });
      setInputText('');
      setIsTyping(true);

      try {
        const response = await fetch('http://127.0.0.1:5000/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: trimmedInputText }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const botMessage: Message = { text: `Tahmin: ${data.prediction}`, sender: 'bot' };
        console.log('Bot mesajı alındı:', botMessage);
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, botMessage];
          console.log('Messages dizisi güncellendi (bot):', updatedMessages);
          return updatedMessages;
        });
      } catch (error: any) {
        console.error('Tahmin API\'sinde bir hata oluştu:', error);
        const errorMessage: Message = { text: 'Tahmin sırasında bir hata oluştu.', sender: 'bot', error: true };
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, errorMessage];
          console.log('Messages dizisi güncellendi (hata):', updatedMessages);
          return updatedMessages;
        });
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-6 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md shadow-lg rounded-lg flex flex-col bg-gray-800 text-white">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-semibold text-center">Haber Kategorisi Botu</h1>
        </div>
        <CardContent className="p-4 flex-grow overflow-y-auto max-h-96 flex flex-col space-y-2" ref={chatMessagesRef}>
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`rounded-lg p-3 max-w-xs break-words ${
                  message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                {message.text}
                {message.error && <span className="text-red-500 font-bold"> (Hata)</span>}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-lg p-3 bg-gray-600 text-gray-400 max-w-xs italic">
                Bot yazıyor...
              </div>
            </div>
          )}
        </CardContent>
        <div className="p-4 border-t border-gray-700 flex space-x-2">
          <Input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Haber başlığı girin..."
            className="bg-gray-700 text-white border-gray-600 focus-ring-2 focus-ring-blue-500"
          />
          <Button onClick={handleSendMessage} className="bg-blue-600 text-white">
            Gönder <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Chatbot;