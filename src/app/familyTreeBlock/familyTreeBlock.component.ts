import { Component, OnInit, signal, computed } from '@angular/core';
import { FamilyTreeService } from '../familytree/familytree.service';
import { FamilyTree } from '../familytree/familytree';
import { FamilyTreeComponent } from '../familytree/familytree.component';

@Component({
  selector: 'app-familyTreeBlock',
  templateUrl: './familyTreeBlock.component.html',
  styleUrls: ['./familyTreeBlock.component.css'],
  imports: [FamilyTreeComponent]
})
export class FamilyTreeBlockComponent implements OnInit {
  // Use signal to hold the family tree data
  familyTree = signal<FamilyTree | null>(null);

  // Optional computed for derived data if needed (here just an example)
  familyTreeAvailable = computed(() => this.familyTree() !== null);

  constructor(private service: FamilyTreeService) { }

  ngOnInit() {
    this.service.getFamilies().subscribe({
      next: (data) => this.familyTree.set(data),
      error: (err) => {
        console.error('Error loading family tree', err);
        this.familyTree.set(null);
      }
    });
  }
}