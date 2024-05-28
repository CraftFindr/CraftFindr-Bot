from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
from api.models import ArtisanProfile
from api.models import User
from telegram import Update
from telegram.ext import Updater, CommandHandler, CallbackContext
def handle_user_registration(update: Update, context: CallbackContext):
    # Accessing user information from the update object
    telegram_user = update.message.from_user
    telegram_id = telegram_user.id
    first_name = telegram_user.first_name
    last_name = telegram_user.last_name
    username = telegram_user.username
    # Determine if the user is an artisan (this might come from user input or another part of your bot logic)
    is_artisan = determine_if_artisan(update)
    # Create or update the User object in the database
    user, created = User.objects.get_or_create(
        telegram_id=telegram_id,
        defaults={
            "first_name": first_name,
            "last_name": last_name,
            "username": username,
            "is_artisan": is_artisan,
        },
    )
    if not created:
        # Update user details if they already exist
        user.first_name = first_name
        user.last_name = last_name
        user.username = username
        user.is_artisan = is_artisan
        user.save()
    # Inform the user via the bot
    if created and is_artisan:
        context.bot.send_message(
            chat_id=update.message.chat_id, text="Artisan profile created!"
        )
    elif created:
        context.bot.send_message(
            chat_id=update.message.chat_id, text="Customer profile created!"
        )
    else:
        context.bot.send_message(
            chat_id=update.message.chat_id, text="Profile updated!"
        )
def determine_if_artisan(update: Update) -> bool:
    # Implement logic to determine if the user is an artisan
    # This could involve asking the user directly via the bot interface
    # For this example, we'll assume the user is an artisan if they send a specific command
    return "/register_as_artisan" in update.message.text
# Setting up the bot with python-telegram-bot
def main():
    updater = Updater("YOUR_BOT_TOKEN", use_context=True)
    dispatcher = updater.dispatcher
    # Register the handler for the registration command
    dispatcher.add_handler(CommandHandler("start", handle_user_registration))
    updater.start_polling()
    updater.idle()
if __name__ == "__main__":
    main()
class ArtisanListApi(APIView):
    class OutPutSerializer(serializers.Serializer):
        username = serializers.CharField(max_length=100)
        # services_offered = serializers.CharField(max_length=100)
        phone_number = serializers.CharField(max_length=15)
    # extract this into a selector later
    def get(self, request):
        artisans = self.OutPutSerializer(ArtisanProfile.objects.all(), many=True)
        return Response(artisans.data)