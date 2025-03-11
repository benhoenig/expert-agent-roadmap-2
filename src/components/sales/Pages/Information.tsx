
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, FileText, BookOpen, HelpCircle, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function SalesInformation() {
  const resources = [
    { 
      title: "Sales Playbook", 
      description: "Comprehensive guide for sales strategies",
      icon: BookOpen,
      date: "Updated 2 weeks ago"
    },
    { 
      title: "Product Documentation", 
      description: "Complete product details and specifications",
      icon: FileText,
      date: "Updated 1 month ago"
    },
    { 
      title: "Objection Handling Guide", 
      description: "How to address common customer concerns",
      icon: HelpCircle,
      date: "Updated 3 weeks ago"
    }
  ];

  const faqs = [
    {
      question: "What are our competitive advantages?",
      answer: "Our platform offers superior integration capabilities, a more intuitive user interface, and 24/7 customer support which sets us apart from competitors."
    },
    {
      question: "What is our pricing structure?",
      answer: "We offer tiered pricing based on user count and feature access. Basic starts at $49/mo, Premium at $99/mo, and Enterprise has custom pricing."
    },
    {
      question: "What is the implementation timeline?",
      answer: "Typical implementation takes 2-4 weeks depending on complexity, with our dedicated onboarding team providing support throughout the process."
    },
    {
      question: "Do we offer customization options?",
      answer: "Yes, all Enterprise plans include customization options. Basic and Premium plans can add custom features for additional fees."
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Information Center</h2>
        <p className="text-muted-foreground">Resources and knowledge base for the sales team</p>
      </div>

      <Tabs defaultValue="resources">
        <TabsList className="mb-4">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resources.map((resource, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-gold-100 text-gold-700">
                      <resource.icon size={16} />
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                  </div>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{resource.date}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5 text-gold-500" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Common questions and answers for the sales team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i}>
                    <h3 className="font-medium mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    {i < faqs.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
