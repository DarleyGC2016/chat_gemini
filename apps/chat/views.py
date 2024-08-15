import json
from django.http import HttpResponse
from django.shortcuts import render
from .models import Message, Room
from django.views.generic.detail import DetailView
import google.generativeai as genai


API_KEY = 'key_api'

genai.configure(api_key= API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def home(request):
    rooms = Room.objects.all().order_by('-created_at')
    return render(request, 'chat/home.html',
            {
                "rooms": rooms
            }
    )

class RoomDetailView(DetailView):
    model = Room
    template_name = 'chat/list-message.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context

def send_message(request, pk):
    
    data = json.loads(request.body)
    room = Room.objects.get(id = pk)
    new_message = Message.objects.create(user = request.user, text = data["message"])
    room.messages.add(new_message)

    response = response_api(new_message.text)
    print(f'response: {response}')
    return render(request, 'chat/message.html',{
        "message": new_message,
        "gemini": response
    })

def create_room(request):
    print('request: ',request)
    data = json.loads(request.body)
    room = Room.objects.create(user = request.user, title = data["title"])
    return render(request, 'chat/room.html',{
        "room": room
    })

def response_api(ask) -> str: 
    response = model.generate_content(ask)
    return response.text