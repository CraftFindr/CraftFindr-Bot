import os
import logging
from typing import Final
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Updater, ApplicationBuilder, ContextTypes, CommandHandler, CallbackQueryHandler, MessageHandler, filters

from dotenv import load_dotenv

load_dotenv()
TOKEN: Final = os.getenv("TOKEN")
BOT_USERNAME: Final = os.getenv("BOT_USERNAME")

import logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

print("Starting...")
application = ApplicationBuilder().token(TOKEN).build()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [
            InlineKeyboardButton("Hairdresser", callback_data="Hairdresser"),
            InlineKeyboardButton("Nail technician", callback_data="Nail technician"),
        ], 
        [   InlineKeyboardButton("Plumber", callback_data="Plumber"),
            InlineKeyboardButton("Electrician", callback_data="Electrician")
         ],
         [InlineKeyboardButton("Home Cleaning", callback_data="Home Cleaning")
          ]
    ]

    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text("Welcome to CraftFindr Bot. What service are you looking for?", reply_markup=reply_markup)

async def button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    await context.bot.sendMessage(chat_id=query.message.chat_id, text=f"We currently don't have any {query.data}s. Please try again later.")


async def help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await context.bot.send_message(chat_id=update.effective_chat.id, text="I'm a simple bot. I help you find services near you. Type /start to get started.")

application.add_handler(CommandHandler("start", start))
application.add_handler(CommandHandler("help", help))
application.add_handler(CallbackQueryHandler(button))

print("Polling...")
application.run_polling()




