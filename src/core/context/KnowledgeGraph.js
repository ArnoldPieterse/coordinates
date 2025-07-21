/**
 * KnowledgeGraph - Maintains relationships between features, code, docs, tests, and users.
 */

export class KnowledgeGraph {
  constructor() {
    this.nodes = new Map(); // id -> node
    this.edges = []; // { from, to, type }
  }

  // Add a node (feature, code, doc, test, user, etc.)
  addNode(id, data) {
    this.nodes.set(id, { ...data, id });
  }

  // Add an edge (relationship)
  addEdge(from, to, type) {
    this.edges.push({ from, to, type });
  }

  // Get node by id
  getNode(id) {
    return this.nodes.get(id);
  }

  // Get all nodes of a type
  getNodesByType(type) {
    return Array.from(this.nodes.values()).filter(n => n.type === type);
  }

  // Get all edges of a type
  getEdgesByType(type) {
    return this.edges.filter(e => e.type === type);
  }

  // Get all relationships for a node
  getRelationships(id) {
    return this.edges.filter(e => e.from === id || e.to === id);
  }

  // Find related nodes
  findRelated(id, type = null) {
    const related = this.edges.filter(e => (e.from === id || e.to === id) && (!type || e.type === type));
    return related.map(e => e.from === id ? this.getNode(e.to) : this.getNode(e.from));
  }
}

export default KnowledgeGraph; 