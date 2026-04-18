"""
Centralized logging configuration for the ML API.
Logs are rotated daily with automatic archiving.
"""
import logging
import sys
from pathlib import Path
from logging.handlers import TimedRotatingFileHandler

# Create logs directory if needed
LOGS_DIR = Path(__file__).resolve().parent.parent.parent / "logs"
LOGS_DIR.mkdir(exist_ok=True)

LOG_FILE = LOGS_DIR / "app.log"


def get_logger(name: str) -> logging.Logger:
    """
    Get a configured logger instance with daily rotation.
    
    Args:
        name: Module name (typically __name__)
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    
    # Only configure if not already configured
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)
        
        # Console handler (INFO level)
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        console_handler.setFormatter(console_formatter)
        
        # Rotating file handler (DEBUG level, daily rotation)
        # when='midnight' = rotation at midnight (00:00)
        # interval=1 = every 1 day
        # backupCount=30 = keep last 30 days
        file_handler = TimedRotatingFileHandler(
            filename=LOG_FILE,
            when='midnight',
            interval=1,
            backupCount=30,
            encoding='utf-8'
        )
        file_handler.setLevel(logging.DEBUG)
        file_formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        file_handler.setFormatter(file_formatter)
        
        # Add suffix to rotated files (e.g., app.log.2026-03-22)
        file_handler.suffix = "%Y-%m-%d"
        
        # Add handlers
        logger.addHandler(console_handler)
        logger.addHandler(file_handler)
    
    return logger
