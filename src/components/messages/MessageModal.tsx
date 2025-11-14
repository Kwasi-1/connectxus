import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/global";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  getOrCreateDirectConversation,
  sendMessage,
  getMessagesBetweenUsers,
  Message,
} from "@/api/messaging.api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: User;
}

export function MessageModal({
  isOpen,
  onClose,
  recipient,
}: MessageModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (isOpen && recipient.id) {
      setIsLoadingMessages(true);
      getMessagesBetweenUsers(recipient.id, { page: 1, limit: 50 })
        .then((data) => {
          setMessages(data);
        })
        .catch((error) => {
          console.error("Failed to fetch messages:", error);
        })
        .finally(() => {
          setIsLoadingMessages(false);
        });
    }
  }, [isOpen, recipient.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await getOrCreateDirectConversation(recipient.id);

      if (message.trim()) {
        await sendMessage(response.conversation_id, {
          content: message.trim(),
          message_type: "text",
        });
      }

      toast({
        title: "Opening chat...",
        description: `Starting conversation with ${recipient.displayName}.`,
      });

      navigate(`/messages/${response.conversation_id}`);
      onClose();
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-3 py-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={recipient.avatar} alt={recipient.displayName} />
            <AvatarFallback>
              {recipient.displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{recipient.displayName}</h3>
            <p className="text-sm text-muted-foreground">{recipient.email}</p>
          </div>
        </div>

        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length > 0 ? (
          <div className="border rounded-md p-4 mb-4">
            <h4 className="text-sm font-medium mb-2">Previous Messages</h4>
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col space-y-1">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium">
                        {msg.sender_full_name || msg.sender_username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm pl-2">{msg.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
