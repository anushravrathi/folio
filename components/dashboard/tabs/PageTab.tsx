import { HeaderSection } from "../sections/HeaderSection"
import { AboutSection } from "../sections/AboutSection"
import { ExperienceSection } from "../sections/ExperienceSection"
import { SkillsSection } from "../sections/SkillsSection"
import { ProjectsSection } from "../sections/ProjectsSection"
import { LinksSection } from "../sections/LinksSection"

import { IntegrationsSection } from "../sections/IntegrationsSection"
import { EducationSection } from "../sections/EducationSection"

export function PageTab() {
  return (
    <div className="space-y-6">
      <HeaderSection />
      <IntegrationsSection />
      <EducationSection />
      <AboutSection />
      <ExperienceSection />
      <SkillsSection />
      <ProjectsSection />
      <LinksSection />
    </div>
  )
}
