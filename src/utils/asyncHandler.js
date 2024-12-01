// asyncHandler.js (inside utils)
const asyncHandler = (fn) => async (event, context) => {
  try {
    return await fn(event, context); // Directly return the result from the async function
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: err.message }),
    };
  }
};

export default asyncHandler;
