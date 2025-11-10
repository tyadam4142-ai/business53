import React, { useState, FormEvent, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageAuthor, ChatMessage } from './types';
import ChatMessageComponent from './components/ChatMessage';

// --- SVG Icons --- //
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>;
const ChatBubbleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a1.125 1.125 0 0 1-1.59 0l-3.72-3.72A1.125 1.125 0 0 1 9 17.25v-4.286c0-.97.616-1.813 1.5-2.097m6.75-3.6-3.75-3.75a1.125 1.125 0 0 0-1.59 0L9 4.91m6.75 3.6-3.75-3.75a1.125 1.125 0 0 0-1.59 0L9 4.91m6.75 3.6-3.75-3.75a1.125 1.125 0 0 0-1.59 0L9 4.91M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const CubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>;
const PaperclipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>;

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [activeSection, setActiveSection] = useState<string>('Chat with Data');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);


    React.useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const submitPrompt = async () => {
        if (!prompt.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), author: MessageAuthor.USER, text: prompt };
        setChatHistory(prev => [...prev, userMessage]);
        const currentPrompt = prompt;
        setPrompt('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            let systemInstruction = `You are "business53", an expert AI assistant that analyzes business data from uploaded spreadsheets. Your tone is professional, insightful, and helpful.`;
            let fullPrompt = ``;

            if (uploadedFile) {
                fullPrompt += `The user has uploaded a file named "${uploadedFile.name}". Assume this file contains columns for 'Product', 'Status', 'Revenue', 'Order ID', 'Date', etc. Based on the likely contents of this file, answer the user's question concisely.`;
            } else {
                fullPrompt += `The user has not uploaded a file. Politely ask them to upload an Excel or Tally sheet to get started with data analysis.`;
            }
            fullPrompt += `\n\nUser's question: "${currentPrompt}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: fullPrompt,
                config: { systemInstruction }
            });

            const modelMessage: ChatMessage = { id: Date.now().toString() + 'model', author: MessageAuthor.MODEL, text: response.text };
            setChatHistory(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { id: Date.now().toString() + 'error', author: MessageAuthor.SYSTEM, text: 'Sorry, something went wrong. Please check your connection or API key and try again.' };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        await submitPrompt();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadedFile(file);
            setChatHistory([
                { id: Date.now().toString() + 'system1', author: MessageAuthor.SYSTEM, text: `File "${file.name}" uploaded successfully.` },
                { id: Date.now().toString() + 'system2', author: MessageAuthor.SYSTEM, text: `You can now ask questions like "What's the total revenue?" or "How many orders are pending?"` },
            ]);
        }
    };
    
    // FIX: Changed icon type from JSX.Element to React.ReactNode to resolve namespace error.
    const NavItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
        <button
            onClick={() => setActiveSection(label)}
            className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-lg ${activeSection === label ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'}`}
        >
            {icon}
            <span className="ml-4 font-medium">{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-slate-900 text-gray-200 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 p-4 flex flex-col flex-shrink-0 border-r border-slate-700">
                <div className="flex items-center mb-8">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-yellow-400 rounded-lg"></div>
                    <h1 className="text-xl font-bold ml-3 text-white">business53</h1>
                </div>
                <nav className="flex flex-col space-y-2">
                    <NavItem icon={<ChartBarIcon />} label="Dashboard" />
                    <NavItem icon={<ChatBubbleIcon />} label="Chat with Data" />
                    <NavItem icon={<CubeIcon />} label="Products" />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen">
                <header className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-white">{activeSection}</h2>
                </header>

                <div className="flex-grow p-6 overflow-y-auto">
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {chatHistory.map(msg => (
                            <ChatMessageComponent key={msg.id} message={msg} />
                        ))}
                         <div ref={chatEndRef} />
                    </div>
                </div>

                <div className="px-6 pb-6 max-w-4xl mx-auto w-full">
                    {uploadedFile && (
                         <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 px-4 mb-2 text-sm text-gray-400 flex justify-between items-center">
                            <span>Attached: <span className="font-medium text-gray-300">{uploadedFile.name}</span></span>
                             <button onClick={() => { setUploadedFile(null); setChatHistory([]) }} className="text-red-400 hover:text-red-300 font-bold text-xl">&times;</button>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            // FIX: Refactored to call a shared, event-agnostic function to prevent type errors.
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    await submitPrompt();
                                }
                            }}
                            placeholder={uploadedFile ? `Ask about ${uploadedFile.name}...` : "Upload a file to start..."}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 pr-32 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                            rows={1}
                            disabled={isLoading}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls, .csv" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
                                <PaperclipIcon />
                            </button>
                            <button type="submit" disabled={isLoading || !prompt.trim()} className="p-2 rounded-full bg-yellow-500 text-slate-900 disabled:bg-gray-600 hover:bg-yellow-400 transition-colors">
                                {isLoading ? <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div> : <SendIcon />}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default App;