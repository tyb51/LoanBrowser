import uvicorn

if __name__ == "__main__":
    # Use the --reload flag for development
    # The --timeout-keep-alive parameter helps with long-running calculations
    # Setting host to 0.0.0.0 makes the server accessible from other devices on the network
    uvicorn.run(
        "api.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        timeout_keep_alive=120
    )
