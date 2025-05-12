# Backend Setup

## Environment Variables

This project uses environment variables to store sensitive information like API keys. To set up your environment:

1. Create a `.env` file in the backend directory
2. Add the following variables to your `.env` file:

```
FINNHUB_API_KEY=your_finnhub_api_key
```

You can obtain a Finnhub API key by signing up at [Finnhub.io](https://finnhub.io/).

## Running the Application

Make sure you have all the required dependencies installed:

```
pip install -r requirements.txt
```

Then run the application:

```
python main.py
```

Or with uvicorn:

```
uvicorn main:app --reload
```

## Committing Changes

After making changes to the codebase, you need to commit them to see them in the repository history:

```
# Add all modified and new files
git add .

# Or add specific files
git add path/to/file1 path/to/file2

# Commit the changes with a descriptive message
git commit -m "Your commit message here"

# Push the changes to the remote repository
git push
```

Note: The `.env` file is excluded from Git tracking for security reasons. Make sure each developer creates their own `.env` file locally.
