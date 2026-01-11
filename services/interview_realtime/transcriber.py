"""
Real-time Audio Transcription Service
Converts audio streams to text using Whisper API
"""

import asyncio
import io
import logging
import tempfile
import wave
from typing import AsyncGenerator, Optional, List
import aiohttp
import numpy as np
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class TranscriptionResult(BaseModel):
    text: str
    confidence: float
    timestamp: float
    speaker: Optional[str] = None

class AudioTranscriber:
    def __init__(self, whisper_api_key: str = None):
        self.whisper_api_key = whisper_api_key
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def transcribe_audio_chunk(self, audio_data: bytes, sample_rate: int = 16000) -> TranscriptionResult:
        """Transcribe a single audio chunk"""
        try:
            if self.whisper_api_key:
                return await self._transcribe_with_whisper_api(audio_data)
            else:
                return await self._transcribe_with_local_whisper(audio_data, sample_rate)
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            return TranscriptionResult(text="", confidence=0.0, timestamp=0.0)
    
    async def _transcribe_with_whisper_api(self, audio_data: bytes) -> TranscriptionResult:
        """Transcribe using OpenAI Whisper API"""
        try:
            url = "https://api.openai.com/v1/audio/transcriptions"
            headers = {
                "Authorization": f"Bearer {self.whisper_api_key}",
            }
            
            data = aiohttp.FormData()
            data.add_field('file', audio_data, filename='audio.wav', content_type='audio/wav')
            data.add_field('model', 'whisper-1')
            data.add_field('response_format', 'verbose_json')
            
            async with self.session.post(url, headers=headers, data=data) as response:
                if response.status == 200:
                    result = await response.json()
                    return TranscriptionResult(
                        text=result.get("text", ""),
                        confidence=result.get("confidence", 0.0),
                        timestamp=result.get("timestamp", 0.0)
                    )
                else:
                    logger.error(f"Whisper API error: {response.status}")
                    return TranscriptionResult(text="", confidence=0.0, timestamp=0.0)
                    
        except Exception as e:
            logger.error(f"Whisper API transcription error: {e}")
            return TranscriptionResult(text="", confidence=0.0, timestamp=0.0)
    
    async def _transcribe_with_local_whisper(self, audio_data: bytes, sample_rate: int) -> TranscriptionResult:
        """Transcribe using local Whisper model (fallback)"""
        try:
            # This would require installing whisper locally
            # For now, return a mock result
            logger.warning("Local Whisper not implemented, using mock transcription")
            return TranscriptionResult(
                text="Mock transcription - install whisper locally for real transcription",
                confidence=0.8,
                timestamp=0.0
            )
        except Exception as e:
            logger.error(f"Local Whisper transcription error: {e}")
            return TranscriptionResult(text="", confidence=0.0, timestamp=0.0)
    
    async def transcribe_stream(self, audio_stream: AsyncGenerator[bytes, None]) -> AsyncGenerator[TranscriptionResult, None]:
        """Transcribe a continuous audio stream"""
        buffer = b""
        chunk_size = 1024 * 4  # 4KB chunks
        
        async for audio_chunk in audio_stream:
            buffer += audio_chunk
            
            # Process when buffer reaches chunk size
            if len(buffer) >= chunk_size:
                result = await self.transcribe_audio_chunk(buffer)
                if result.text.strip():
                    yield result
                buffer = b""
        
        # Process remaining buffer
        if buffer:
            result = await self.transcribe_audio_chunk(buffer)
            if result.text.strip():
                yield result
    
    def preprocess_audio(self, audio_data: bytes, target_sample_rate: int = 16000) -> bytes:
        """Preprocess audio data for transcription"""
        try:
            # Convert to numpy array
            audio_array = np.frombuffer(audio_data, dtype=np.int16)
            
            # Normalize audio
            audio_array = audio_array.astype(np.float32) / 32768.0
            
            # Resample if needed (simplified - would need librosa for proper resampling)
            if len(audio_array) > 0:
                # Simple normalization
                audio_array = audio_array / np.max(np.abs(audio_array))
            
            # Convert back to bytes
            processed_audio = (audio_array * 32767).astype(np.int16).tobytes()
            
            return processed_audio
            
        except Exception as e:
            logger.error(f"Audio preprocessing error: {e}")
            return audio_data
    
    async def transcribe_file(self, file_path: str) -> List[TranscriptionResult]:
        """Transcribe an audio file"""
        results = []
        
        try:
            with open(file_path, 'rb') as f:
                audio_data = f.read()
            
            # Process in chunks for large files
            chunk_size = 1024 * 1024  # 1MB chunks
            for i in range(0, len(audio_data), chunk_size):
                chunk = audio_data[i:i + chunk_size]
                result = await self.transcribe_audio_chunk(chunk)
                if result.text.strip():
                    results.append(result)
            
            return results
            
        except Exception as e:
            logger.error(f"File transcription error: {e}")
            return results

class RealTimeTranscriber:
    """Real-time transcription with buffering and streaming"""
    
    def __init__(self, transcriber: AudioTranscriber):
        self.transcriber = transcriber
        self.audio_buffer = []
        self.buffer_duration = 2.0  # seconds
        self.sample_rate = 16000
        
    async def add_audio_chunk(self, audio_chunk: bytes, timestamp: float):
        """Add audio chunk to buffer"""
        self.audio_buffer.append({
            "data": audio_chunk,
            "timestamp": timestamp
        })
        
        # Process buffer if it's long enough
        if len(self.audio_buffer) >= self.buffer_duration * self.sample_rate // 1024:
            await self._process_buffer()
    
    async def _process_buffer(self):
        """Process accumulated audio buffer"""
        if not self.audio_buffer:
            return
        
        # Combine audio chunks
        combined_audio = b"".join([chunk["data"] for chunk in self.audio_buffer])
        
        # Transcribe
        result = await self.transcriber.transcribe_audio_chunk(combined_audio)
        
        # Update timestamp
        if self.audio_buffer:
            result.timestamp = self.audio_buffer[0]["timestamp"]
        
        # Clear buffer
        self.audio_buffer = []
        
        return result
    
    async def flush_buffer(self) -> Optional[TranscriptionResult]:
        """Process remaining audio in buffer"""
        if self.audio_buffer:
            return await self._process_buffer()
        return None
