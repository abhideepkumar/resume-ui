"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import parseResumeData from '../../utils/responseToJson.js'
import { Button } from "../../components/ui/button.jsx"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Upload,
  GraduationCap,
  Briefcase,
  Code,
  FileText,
  Search,
  LogOut,
  Calendar,
  Mail,
  TrendingUp,
  DollarSign,
} from "lucide-react"

interface ApplicantData {
  _id: string
  name: string
  email: string
  education: Array<{
    degree: string
    branch: string
    institution: string
    year: string
    _id: string
  }>
  experience: Array<{
    job_title: string
    company: string
    start_date: string
    end_date: string
    _id: string
  }>
  projects: Array<{
    project_name: string
    description: string
    skills_used: Array<{ skill_name: string; level: number;_id: string;}>
    _id: string
  }>
  skills: Array<{
    skill_name: string
    level: number
    _id: string;
  }>
  summary: string
  predicted_designation: string[]
  predicted_experience: string[]
  predicted_salary: string[]
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const [resumeUrl, setResumeUrl] = useState("")
  const [searchName, setSearchName] = useState("")
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [applicantData, setApplicantData] = useState<ApplicantData | null>(null)
  const [searchResults, setSearchResults] = useState<ApplicantData[]>([])
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth-token="))
      ?.split("=")[1]

    if (!token) {
      router.push("/login")
    }
  }, [router])

  const getAuthToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth-token="))
      ?.split("=")[1]
  }

  const handleLogout = () => {
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    router.push("/login")
  }

  const handleUploadResume = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    setApplicantData(null)

    const token = getAuthToken()
    if (!token) {
      router.push("/login")
      return
    }

    try {
      console.log("Tpken", token)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/resume/uploadResume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: resumeUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Resume uploaded and parsed successfully!")
        console.log("applicant data", data.data.generatedContent)
        parseResumeData(data.data.generatedContent)
        setApplicantData(parseResumeData(data.data.generatedContent))
        setResumeUrl("")
      } else {
        setError(data.message || "Failed to upload resume")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearchResume = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setError("")
    setSearchResults([])

    const token = getAuthToken()
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/resume/searchResume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: searchName }),
      })

      const data = await response.json()

      if (response.ok) {
        setSearchResults(data.data || [])
        console.log("Users fetched", data.data)
      } else {
        setError(data.message || "Search failed")
      }
    } catch{
      setError("Network error. Please try again.")
    } finally {
      setSearching(false)
    }
  }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })
  }

  const ApplicantCard = ({ applicant }: { applicant: ApplicantData }) => (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {applicant.name
                }
            </div>
            <div>
              <CardTitle className="text-2xl">{applicant.name}</CardTitle>
              <div className="flex items-center text-gray-600 mt-1">
                <Mail className="h-4 w-4 mr-2" />
                {applicant.email}
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>Added: {formatDate(applicant.createdAt)}</div>
            <div>Updated: {formatDate(applicant.updatedAt)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Predicted Role</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {applicant.predicted_designation && applicant.predicted_designation.map((role, index) => (
                          <Badge key={index} variant="secondary">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Experience Level</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {applicant.predicted_experience && applicant.predicted_experience.map((exp, index) => (
                          <Badge key={index} variant="outline">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Salary Range</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {applicant.predicted_salary &&applicant.predicted_salary.map((salary, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {salary}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{applicant.summary}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-4">
            {applicant.education.map((edu, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <GraduationCap className="h-6 w-6 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.branch}</p>
                      <p className="text-gray-500">{edu.institution}</p>
                      <Badge variant="outline" className="mt-2">
                        {edu.year}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="experience" className="space-y-4">
            {applicant.experience.map((exp, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Briefcase className="h-6 w-6 text-green-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{exp.job_title}</h3>
                      <p className="text-gray-600 font-medium">{exp.company}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            {applicant.projects.map((project, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Code className="h-6 w-6 text-purple-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{project.project_name}</h3>
                      <p className="text-gray-700 mb-3 leading-relaxed">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.skills_used.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill.skill_name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

        <TabsContent value="skills" className="space-y-4">
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
    {applicant.skills.map((skill, index) => (
      <div key={index} className="bg-white border rounded-md p-2 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900 text-sm truncate pr-1">{skill.skill_name}</h3>
          <Badge 
            variant={skill.level >= 4 ? "default" : skill.level >= 3 ? "secondary" : "outline"}
            className="text-xs flex-shrink-0 px-1 py-0"
          >
            {skill.level}
          </Badge>
        </div>
        
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`w-2 h-2 rounded-full ${
                level <= skill.level 
                  ? 'bg-blue-500' 
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Resume Parser Dashboard</h1>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upload Resume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Resume
              </CardTitle>
              <CardDescription>Paste a resume URL to parse and analyze with AI</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadResume} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resumeUrl">Resume URL</Label>
                  <Input
                    id="resumeUrl"
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Parse
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Search Resume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Search Applicants
              </CardTitle>
              <CardDescription>Search for previously parsed resumes by name</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearchResume} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="searchName">Applicant Name</Label>
                  <Input
                    id="searchName"
                    type="text"
                    placeholder="Enter name to search..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={searching}>
                  {searching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        <div className="space-y-6">
          {applicantData && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Parsed Resume Data</h2>
              <ApplicantCard applicant={applicantData} />
            </div>
          )}

          {searchResults.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Search Results ({searchResults.length} found)</h2>
              {searchResults.map((applicant) => (
                <ApplicantCard key={applicant._id} applicant={applicant} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
