const parseResumeData = (response) => {
  try {
    const jsonString = response.replace("```json\n", "").replace("\n```", "").trim();

    const resumeData = JSON.parse(jsonString);
    return resumeData;
  } catch (error) {
    console.error("Error parsing resume data:", error);
    return null;
  }
};

export default parseResumeData ;
