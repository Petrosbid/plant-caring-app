from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from huggingface_hub import snapshot_download

snapshot_download(
    repo_id="google/gemma-3-270m-it",
)
# Load tokenizer and model (Gemma instruction-tuned)
model_name = "google/gemma-3-270m-it"  # Note: Verify model name; if invalid, replace with e.g., "google/gemma-2-2b-it"
if torch.cuda.is_available():
    dtype = torch.float16
    device_map = "auto"
else:
    dtype = torch.float32   # CPU فقط با float32 پایدار است
    device_map = "cpu"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,       # Use half precision to save memory
    device_map="auto"                # Automatically use GPU if available
)

# Chat template for instruction-tuned model
# Wrap user input in the expected format
user_input = input("You: ")
messages = [{"role": "user", "content": user_input}]
prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

# Tokenize and generate
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
outputs = model.generate(
    **inputs,
    max_new_tokens=512,
    do_sample=True,
    temperature=0.7,
    top_p=0.9,
    pad_token_id=tokenizer.eos_token_id
)

# Decode and print the response
response = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
print(f"Model: {response}")