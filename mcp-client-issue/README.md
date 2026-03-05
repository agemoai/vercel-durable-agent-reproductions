# Setup .env.local
```
# Add your OpenAI API key here
OPENAI_API_KEY=
```

# Run Dev Server

```
pnpm run dev
```

# Reproduction

Ask the agent anything

You will see we get an error because we cant pass non serializable args to a workflow

If we move the mcp initialization into the worklfow function we get errors becuase many node apis are not there

we have solved this internally by serializing the mcp tools without the implementation exec function then passing this 
list into the workflow 

then havinng a single step that handles all of the mcp calls. 